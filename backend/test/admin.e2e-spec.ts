/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return -- supertest types the server and JSON body as any */
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role } from '@prisma/client';
import request from 'supertest';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { PrismaService } from '../src/modules/shared/prisma/prisma.service';
import { hashData } from '../src/modules/shared/utils';

const ORIGIN = 'http://localhost:3000';
const PASSWORD = 'Password1';

describe('admin endpoints', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const stamp = Date.now();
  const adminEmail = `e2e-admin-${stamp}@example.com`;
  const userEmail = `e2e-member-${stamp}@example.com`;
  let adminId = '';
  let userId = '';
  let adminCookie = '';
  let userCookie = '';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    const passwordHash = await hashData(PASSWORD);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'E2E Admin',
        passwordHash,
        role: Role.SUPER_ADMIN,
        emailVerifiedAt: new Date(),
      },
      select: { id: true },
    });
    const member = await prisma.user.create({
      data: { email: userEmail, fullName: 'E2E Member', passwordHash, emailVerifiedAt: new Date() },
      select: { id: true },
    });
    adminId = admin.id;
    userId = member.id;
    adminCookie = await login(adminEmail);
    userCookie = await login(userEmail);
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { actorId: adminId } });
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, userEmail] } } });
    await app.close();
  });

  function server() {
    return request(app.getHttpServer());
  }

  async function login(email: string): Promise<string> {
    const response = await server()
      .post('/api/v1/auth/login')
      .set('Origin', ORIGIN)
      .send({ email, password: PASSWORD })
      .expect(200);
    const raw = response.headers['set-cookie'];
    const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
    const access = list.find((entry) => entry.startsWith('access_token='));
    if (!access) {
      throw new Error('Missing access cookie');
    }
    return access.split(';')[0] ?? '';
  }

  it('lists the routes in Swagger', async () => {
    const docs = await server().get('/api/docs-json').expect(200);
    const paths = Object.keys(docs.body.paths as Record<string, unknown>);
    expect(paths).toEqual(
      expect.arrayContaining([
        '/api/v1/users',
        '/api/v1/users/me',
        '/api/v1/dashboard',
        '/api/v1/audit-logs',
      ]),
    );
  });

  it('lets an admin list, suspend, and audit a user, and blocks self-service admin routes', async () => {
    const listed = await server()
      .get('/api/v1/users')
      .set('Cookie', adminCookie)
      .query({ search: userEmail })
      .expect(200);
    expect(listed.body.data.items.some((item: { email: string }) => item.email === userEmail)).toBe(
      true,
    );
    expect(listed.body.data.items[0].passwordHash).toBeUndefined();

    await server().get('/api/v1/users').set('Cookie', userCookie).expect(403);

    const profile = await server()
      .patch('/api/v1/users/me')
      .set('Origin', ORIGIN)
      .set('Cookie', userCookie)
      .send({ fullName: 'Renamed Member' })
      .expect(200);
    expect(profile.body.data.fullName).toBe('Renamed Member');
    expect(profile.body.data.avatarUrl).toBeNull();

    await server()
      .post('/api/v1/users/me/avatar')
      .set('Origin', ORIGIN)
      .set('Cookie', userCookie)
      .attach('file', Buffer.from('not-an-image'), 'avatar.png')
      .expect(503);

    await server()
      .patch(`/api/v1/users/${adminId}/status`)
      .set('Origin', ORIGIN)
      .set('Cookie', adminCookie)
      .send({ status: 'SUSPENDED' })
      .expect(403);

    await server()
      .patch(`/api/v1/users/${userId}/status`)
      .set('Origin', ORIGIN)
      .set('Cookie', adminCookie)
      .send({ status: 'SUSPENDED' })
      .expect(200);

    const dashboard = await server()
      .get('/api/v1/dashboard')
      .set('Cookie', adminCookie)
      .expect(200);
    expect(dashboard.body.data.totalUsers).toBeGreaterThanOrEqual(2);
    expect(dashboard.body.data.suspendedCount).toBeGreaterThanOrEqual(1);

    const audit = await server().get('/api/v1/audit-logs').set('Cookie', adminCookie).expect(200);
    expect(
      audit.body.data.items.some(
        (item: { action: string; entityId: string }) =>
          item.action === 'USER_SUSPENDED' && item.entityId === userId,
      ),
    ).toBe(true);
    expect(audit.body.data.meta.hasMore).toBe(false);

    await server()
      .delete(`/api/v1/users/${userId}`)
      .set('Origin', ORIGIN)
      .set('Cookie', adminCookie)
      .expect(200);
    await server().get(`/api/v1/users/${userId}`).set('Cookie', adminCookie).expect(404);
  });
});
