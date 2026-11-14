import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';

import { AppConfigService } from '../config/app-config.service';
import { COOKIE_NAMES } from '../shared/constants';
import { PrismaService } from '../shared/prisma/prisma.service';
import { generateRandomString, hashToken } from '../shared/utils';
import { AUTH_MESSAGES } from './constants';
import { authCookieOptions, clearAuthCookieOptions } from './helpers';
import { AUTH_USER_SELECT, type AuthUserProfile } from './types';

type SessionUser = {
  id: string;
  role: AuthUserProfile['role'];
  tokenVersion: number;
};

/**
 * Signs the access and refresh cookies and stores the refresh hash.
 * One stored hash means one active login. A new login replaces the previous hash.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async issueSession(user: SessionUser, response: Response): Promise<AuthUserProfile> {
    // jti makes two tokens signed in the same second different, so refresh reuse can be detected.
    const accessToken = await this.jwt.signAsync(
      { sub: user.id, role: user.role, tv: user.tokenVersion, jti: generateRandomString(16) },
      { secret: this.config.jwtAccessSecret, expiresIn: this.config.jwtAccessTtlSeconds },
    );
    const refreshToken = await this.jwt.signAsync(
      { sub: user.id, tv: user.tokenVersion, jti: generateRandomString(16) },
      { secret: this.config.jwtRefreshSecret, expiresIn: this.config.jwtRefreshTtlSeconds },
    );

    await this.prisma.user.update({
      where: { id: user.id, deletedAt: null },
      data: { refreshTokenHash: hashToken(refreshToken) },
    });

    const options = authCookieOptions(
      this.config.isProduction,
      this.config.jwtAccessTtlSeconds * 1000,
      this.config.jwtRefreshTtlSeconds * 1000,
    );
    response.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, options.access);
    response.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, options.refresh);

    return this.prisma.withSoftDelete.user.findUniqueOrThrow({
      where: { id: user.id },
      select: AUTH_USER_SELECT,
    });
  }

  clearCookies(response: Response): void {
    const options = clearAuthCookieOptions(this.config.isProduction);
    response.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, options.access);
    response.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, options.refresh);
  }

  async verifyRefresh(token: string): Promise<{ sub: string; tv: number }> {
    try {
      const payload: unknown = await this.jwt.verifyAsync(token, {
        secret: this.config.jwtRefreshSecret,
      });
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'sub' in payload &&
        'tv' in payload &&
        typeof payload.sub === 'string' &&
        typeof payload.tv === 'number'
      ) {
        return { sub: payload.sub, tv: payload.tv };
      }
    } catch {
      throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH);
    }
    throw new UnauthorizedException(AUTH_MESSAGES.INVALID_REFRESH);
  }
}
