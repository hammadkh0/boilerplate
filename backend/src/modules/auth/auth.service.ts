import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import type { Response } from 'express';

import { EmailService } from '../emails/email.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import type { AuthUser } from '../shared/types';
import { compareData, generateRandomString, hashData, hashToken } from '../shared/utils';
import { toUserConflictException } from '../shared/helpers';
import { AUTH_MESSAGES, EMAIL_COOLDOWN_MS, RESET_TTL_MS, VERIFICATION_TTL_MS } from './constants';
import type { ChangePasswordDto, RegisterDto, ResetPasswordDto } from './dto';
import { TokenService } from './token.service';
import { AUTH_USER_SELECT, type AuthUserProfile } from './types';

/**
 * Register, login, refresh rotation, verification, and password changes.
 * Forgot-password and resend-verification answer the same way whether or not the email exists.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly lastEmailAt = new Map<string, number>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly emails: EmailService,
  ) {}

  async register(dto: RegisterDto): Promise<{ message: string }> {
    const rawToken = generateRandomString(32);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          fullName: dto.fullName,
          passwordHash: await hashData(dto.password),
          emailVerificationTokenHash: hashToken(rawToken),
          emailVerificationExpiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
        },
        select: { id: true, email: true, fullName: true },
      });
      this.canSend('verify', user.email);
      await this.deliver(user.id, () =>
        this.emails.sendVerification(user.email, user.fullName, rawToken),
      );
    } catch (error) {
      const conflict = toUserConflictException(error);
      if (conflict) {
        throw conflict;
      }
      throw error;
    }
    return { message: AUTH_MESSAGES.REGISTERED };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.withSoftDelete.user.findFirst({
      where: {
        emailVerificationTokenHash: hashToken(token),
        emailVerificationExpiresAt: { gt: new Date() },
      },
      select: { id: true },
    });
    if (!user) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_VERIFICATION);
    }

    await this.prisma.user.update({
      where: { id: user.id, deletedAt: null },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationTokenHash: null,
        emailVerificationExpiresAt: null,
      },
    });
    return { message: AUTH_MESSAGES.EMAIL_VERIFIED };
  }

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.findActiveByEmail(email);
    if (!user || user.emailVerifiedAt || !this.canSend('verify', email)) {
      return { message: AUTH_MESSAGES.RESEND_VERIFICATION };
    }

    const rawToken = generateRandomString(32);
    await this.prisma.user.update({
      where: { id: user.id, deletedAt: null },
      data: {
        emailVerificationTokenHash: hashToken(rawToken),
        emailVerificationExpiresAt: new Date(Date.now() + VERIFICATION_TTL_MS),
      },
    });
    await this.deliver(user.id, () => this.emails.sendVerification(email, user.fullName, rawToken));
    return { message: AUTH_MESSAGES.RESEND_VERIFICATION };
  }

  async login(email: string, password: string, response: Response): Promise<AuthUserProfile> {
    const user = await this.prisma.withSoftDelete.user.findUnique({
      where: { email },
      select: {
        id: true,
        role: true,
        status: true,
        tokenVersion: true,
        passwordHash: true,
      },
    });
    if (
      !user ||
      user.status !== UserStatus.ACTIVE ||
      !(await compareData(password, user.passwordHash))
    ) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);
    }

    await this.prisma.user.update({
      where: { id: user.id, deletedAt: null },
      data: { lastLoginAt: new Date() },
    });
    return this.tokens.issueSession(user, response);
  }

  async refresh(rawToken: string | undefined, response: Response): Promise<AuthUserProfile> {
    if (!rawToken) {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH);
    }

    const payload = await this.tokens.verifyRefresh(rawToken);
    const user = await this.prisma.user.findFirst({
      where: { id: payload.sub, deletedAt: null },
      select: {
        id: true,
        role: true,
        status: true,
        tokenVersion: true,
        refreshTokenHash: true,
      },
    });

    if (!user || user.status !== UserStatus.ACTIVE || user.tokenVersion !== payload.tv) {
      this.tokens.clearCookies(response);
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH);
    }

    if (user.refreshTokenHash !== hashToken(rawToken)) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { tokenVersion: { increment: 1 }, refreshTokenHash: null },
      });
      this.tokens.clearCookies(response);
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH);
    }

    return this.tokens.issueSession(user, response);
  }

  async logout(actor: AuthUser, response: Response): Promise<{ message: string }> {
    await this.prisma.user.updateMany({
      where: { id: actor.id, deletedAt: null },
      data: { refreshTokenHash: null },
    });
    this.tokens.clearCookies(response);
    return { message: AUTH_MESSAGES.LOGGED_OUT };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.findActiveByEmail(email);
    if (!user || !this.canSend('reset', email)) {
      return { message: AUTH_MESSAGES.FORGOT_PASSWORD };
    }

    const rawToken = generateRandomString(32);
    await this.prisma.user.update({
      where: { id: user.id, deletedAt: null },
      data: {
        passwordResetTokenHash: hashToken(rawToken),
        passwordResetExpiresAt: new Date(Date.now() + RESET_TTL_MS),
      },
    });
    await this.deliver(user.id, () =>
      this.emails.sendPasswordReset(email, user.fullName, rawToken),
    );
    return { message: AUTH_MESSAGES.FORGOT_PASSWORD };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.withSoftDelete.user.findFirst({
      where: {
        passwordResetTokenHash: hashToken(dto.token),
        passwordResetExpiresAt: { gt: new Date() },
        status: UserStatus.ACTIVE,
      },
      select: { id: true },
    });
    if (!user) {
      throw new BadRequestException(AUTH_MESSAGES.INVALID_RESET);
    }

    await this.prisma.user.update({
      where: { id: user.id, deletedAt: null },
      data: {
        passwordHash: await hashData(dto.password),
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
        refreshTokenHash: null,
        tokenVersion: { increment: 1 },
      },
    });
    return { message: AUTH_MESSAGES.PASSWORD_RESET };
  }

  async changePassword(
    actor: AuthUser,
    dto: ChangePasswordDto,
    response: Response,
  ): Promise<AuthUserProfile> {
    const user = await this.prisma.withSoftDelete.user.findUnique({
      where: { id: actor.id },
      select: { id: true, passwordHash: true, email: true, fullName: true },
    });
    if (!user || !(await compareData(dto.currentPassword, user.passwordHash))) {
      throw new UnauthorizedException(AUTH_MESSAGES.CURRENT_PASSWORD);
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id, deletedAt: null },
      data: {
        passwordHash: await hashData(dto.newPassword),
        refreshTokenHash: null,
        tokenVersion: { increment: 1 },
      },
      select: { id: true, role: true, tokenVersion: true },
    });
    const profile = await this.tokens.issueSession(updated, response);
    await this.deliver(user.id, () => this.emails.sendPasswordChanged(user.email, user.fullName));
    return profile;
  }

  async getMe(userId: string): Promise<AuthUserProfile> {
    const user = await this.prisma.withSoftDelete.user.findUnique({
      where: { id: userId },
      select: AUTH_USER_SELECT,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async findActiveByEmail(email: string): Promise<{
    id: string;
    fullName: string;
    emailVerifiedAt: Date | null;
  } | null> {
    return this.prisma.withSoftDelete.user.findFirst({
      where: { email, status: UserStatus.ACTIVE },
      select: { id: true, fullName: true, emailVerifiedAt: true },
    });
  }

  private canSend(kind: string, email: string): boolean {
    const key = `${kind}:${email}`;
    const previous = this.lastEmailAt.get(key);
    const now = Date.now();
    if (previous !== undefined && now - previous < EMAIL_COOLDOWN_MS) {
      return false;
    }
    this.lastEmailAt.set(key, now);
    return true;
  }

  private async deliver(userId: string, send: () => Promise<void>): Promise<void> {
    try {
      await send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'email failed';
      this.logger.error(`Email failed for user ${userId}: ${message}`);
    }
  }
}
