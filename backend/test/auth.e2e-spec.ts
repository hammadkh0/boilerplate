/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument -- supertest types the server and JSON body as any */
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request, { type Response } from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { AUTH_MESSAGES } from '../src/modules/auth/constants';
import { EmailService } from '../src/modules/emails/email.service';
import { COOKIE_NAMES } from '../src/modules/shared/constants';
import { PrismaService } from '../src/modules/shared/prisma/prisma.service';

const ORIGIN = 'http://localhost:3000';

function cookieFrom(response: Response, name: string): string {
  const raw = response.headers['set-cookie'];
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const match = list.find((entry) => entry.startsWith(`${name}=`));
  if (!match) {
    throw new Error(`Missing ${name} cookie`);
  }
  return match.split(';')[0]?.slice(name.length + 1) ?? '';
}

function tokenFromLatestEmail(emails: EmailService, to: string): string {
  const message = [...emails.sent].reverse().find((item) => item.to === to);
  const match = message?.html.match(/token=([a-f0-9]+)/);
  if (!match?.[1]) {
    throw new Error('Verification or reset token was not emailed');
  }
  return match[1];
}

describe('auth', () => {
  let app: INestApplication;
  let emails: EmailService;
  let prisma: PrismaService;
  const email = `e2e-${Date.now()}@example.com`;
  const password = 'Password1';
  const nextPassword = 'Password2';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    emails = app.get(EmailService);
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await app.close();
  });

  function server() {
    return request(app.getHttpServer());
  }

  it('registers, verifies, logs in, rotates refresh tokens, and resets the password', async () => {
    const registered = await server()
      .post('/api/v1/auth/register')
      .set('Origin', ORIGIN)
      .send({ email, fullName: 'E2E User', password, confirmPassword: password })
      .expect(201);
    expect(registered.body.data.message).toBe(AUTH_MESSAGES.REGISTERED);

    const missing = await server()
      .post('/api/v1/auth/forgot-password')
      .set('Origin', ORIGIN)
      .send({ email: 'nobody@example.com' })
      .expect(200);
    expect(missing.body.data.message).toBe(AUTH_MESSAGES.FORGOT_PASSWORD);

    const verificationToken = tokenFromLatestEmail(emails, email);
    await server()
      .post('/api/v1/auth/verify-email')
      .set('Origin', ORIGIN)
      .send({ token: verificationToken })
      .expect(200);

    const wrong = await server()
      .post('/api/v1/auth/login')
      .set('Origin', ORIGIN)
      .send({ email, password: 'WrongPass1' })
      .expect(401);
    expect(wrong.body.error.message).toBe(AUTH_MESSAGES.INVALID_CREDENTIALS);

    const unknown = await server()
      .post('/api/v1/auth/login')
      .set('Origin', ORIGIN)
      .send({ email: 'nobody@example.com', password })
      .expect(401);
    expect(unknown.body.error.message).toBe(AUTH_MESSAGES.INVALID_CREDENTIALS);

    const agent = request.agent(app.getHttpServer());
    const login = await agent
      .post('/api/v1/auth/login')
      .set('Origin', ORIGIN)
      .send({ email, password })
      .expect(200);
    expect(login.body.data.email).toBe(email);
    const firstRefresh = cookieFrom(login, COOKIE_NAMES.REFRESH_TOKEN);
    const firstAccess = cookieFrom(login, COOKIE_NAMES.ACCESS_TOKEN);

    const refreshed = await agent.post('/api/v1/auth/refresh').set('Origin', ORIGIN).expect(200);
    expect(refreshed.body.data.email).toBe(email);

    const reused = await server()
      .post('/api/v1/auth/refresh')
      .set('Origin', ORIGIN)
      .set('Cookie', `${COOKIE_NAMES.REFRESH_TOKEN}=${firstRefresh}`)
      .expect(401);
    expect(reused.body.error.message).toBe(AUTH_MESSAGES.INVALID_REFRESH);

    await server()
      .get('/api/v1/auth/me')
      .set('Cookie', `${COOKIE_NAMES.ACCESS_TOKEN}=${firstAccess}`)
      .expect(401);

    const agentAfterTheft = request.agent(app.getHttpServer());
    await agentAfterTheft
      .post('/api/v1/auth/login')
      .set('Origin', ORIGIN)
      .send({ email, password })
      .expect(200);

    await agentAfterTheft
      .post('/api/v1/auth/forgot-password')
      .set('Origin', ORIGIN)
      .send({ email })
      .expect(200);
    const resetToken = tokenFromLatestEmail(emails, email);
    await server()
      .post('/api/v1/auth/reset-password')
      .set('Origin', ORIGIN)
      .send({ token: resetToken, password: nextPassword, confirmPassword: nextPassword })
      .expect(200);

    await server()
      .post('/api/v1/auth/login')
      .set('Origin', ORIGIN)
      .send({ email, password })
      .expect(401);

    const afterReset = await agentAfterTheft
      .post('/api/v1/auth/login')
      .set('Origin', ORIGIN)
      .send({ email, password: nextPassword })
      .expect(200);
    const accessBeforeChange = cookieFrom(afterReset, COOKIE_NAMES.ACCESS_TOKEN);

    await agentAfterTheft
      .post('/api/v1/auth/change-password')
      .set('Origin', ORIGIN)
      .send({
        currentPassword: nextPassword,
        newPassword: password,
        confirmPassword: password,
      })
      .expect(200);

    await server()
      .get('/api/v1/auth/me')
      .set('Cookie', `${COOKIE_NAMES.ACCESS_TOKEN}=${accessBeforeChange}`)
      .expect(401);

    const me = await agentAfterTheft.get('/api/v1/auth/me').expect(200);
    expect(me.body.data.email).toBe(email);
    expect(me.body.data.passwordHash).toBeUndefined();
  });
});
