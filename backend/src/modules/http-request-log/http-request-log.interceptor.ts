import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { AppConfigService } from '../config/app-config.service';
import { getClientIp } from '../shared/utils';
import { HTTP_REQUEST_LOG_SKIP_PATHS } from './constants';
import { HttpRequestLogService } from './http-request-log.service';

/**
 * Records method, path, status, and duration after the response is sent.
 * The write does not block the response. Bodies are not stored.
 * Does nothing while HTTP_REQUEST_LOG_ENABLED is false.
 */
@Injectable()
export class HttpRequestLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpRequestLogInterceptor.name);

  constructor(
    private readonly config: AppConfigService,
    private readonly requestLogs: HttpRequestLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.config.httpRequestLogEnabled) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const path = request.path ?? request.url;
    if (HTTP_REQUEST_LOG_SKIP_PATHS.some((skip) => path === skip || path.startsWith(`${skip}/`))) {
      return next.handle();
    }

    const started = Date.now();
    return next.handle().pipe(
      tap({
        next: () => this.persist(request, context, started),
        error: () => this.persist(request, context, started),
      }),
    );
  }

  private persist(request: Request, context: ExecutionContext, started: number): void {
    const response = context.switchToHttp().getResponse<Response>();
    void this.requestLogs
      .write({
        method: request.method,
        path: (request.path ?? request.url).slice(0, 512),
        statusCode: response.statusCode,
        durationMs: Date.now() - started,
        ip: getClientIp(request),
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'request log failed';
        this.logger.error(message);
      });
  }
}
