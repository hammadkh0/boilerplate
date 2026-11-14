import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Role, UserStatus } from '@prisma/client';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigService } from '../../config/app-config.service';
import { COOKIE_NAMES } from '../../shared/constants';
import { PrismaService } from '../../shared/prisma/prisma.service';
import type { AuthUser, JwtPayload } from '../../shared/types';

function isJwtPayload(value: unknown): value is JwtPayload {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const payload = value as { sub?: unknown; role?: unknown; tv?: unknown };
  return (
    typeof payload.sub === 'string' &&
    (payload.role === Role.USER || payload.role === Role.SUPER_ADMIN) &&
    typeof payload.tv === 'number'
  );
}

/**
 * Reads the access token from the httpOnly cookie and checks the user is still allowed in.
 * A mismatched token version, a suspended user, or a soft-deleted user is rejected.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly prisma: PrismaService;

  constructor(config: AppConfigService, prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token: unknown = request.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
          return typeof token === 'string' ? token : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: config.jwtAccessSecret,
    });
    this.prisma = prisma;
  }

  async validate(payload: unknown): Promise<AuthUser> {
    if (!isJwtPayload(payload)) {
      throw new UnauthorizedException('Invalid access token');
    }

    const user = await this.prisma.withSoftDelete.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, status: true, tokenVersion: true },
    });

    if (!user || user.status !== UserStatus.ACTIVE || user.tokenVersion !== payload.tv) {
      throw new UnauthorizedException('Invalid access token');
    }

    return { id: user.id, role: user.role, tokenVersion: user.tokenVersion };
  }
}
