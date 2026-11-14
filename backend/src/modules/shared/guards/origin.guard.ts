import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

import { AppConfigService } from '../../config/app-config.service';

const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Rejects state-changing requests whose Origin is not in `CORS_ORIGINS`.
 * A missing Origin is rejected as well. Safe methods are allowed through.
 */
@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private readonly config: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<{ method?: string; headers?: { origin?: string } }>();
    const method = request.method?.toUpperCase() ?? 'GET';
    if (!STATE_CHANGING_METHODS.has(method)) {
      return true;
    }

    const origin = request.headers?.origin;
    if (!origin || !this.config.corsOrigins.includes(origin)) {
      throw new ForbiddenException('Origin is not allowed');
    }
    return true;
  }
}
