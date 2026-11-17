import { randomUUID } from 'node:crypto';

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { AuthModule } from './modules/auth/auth.module';
import { AppConfigModule } from './modules/config/config.module';
import { AppConfigService } from './modules/config/app-config.service';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { HealthModule } from './modules/health/health.module';
import { HttpRequestLogModule } from './modules/http-request-log/http-request-log.module';
import { UsersModule } from './modules/users/users.module';
import { HttpExceptionFilter } from './modules/shared/filters';
import { JwtAuthGuard, OriginGuard, RolesGuard } from './modules/shared/guards';
import { ResponseInterceptor } from './modules/shared/interceptors';
import { SharedModule } from './modules/shared/shared.module';
import { buildPinoRedactPaths } from './modules/shared/utils';

@Module({
  imports: [
    AppConfigModule,
    LoggerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        pinoHttp: {
          level: config.isProduction ? 'info' : 'debug',
          redact: { paths: buildPinoRedactPaths(), censor: '[REDACTED]' },
          genReqId: (request, response) => {
            const header = request.headers['x-request-id'];
            const requestId =
              typeof header === 'string' && header.length > 0 ? header : randomUUID();
            response.setHeader('x-request-id', requestId);
            return requestId;
          },
        },
      }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 100 }],
    }),
    SharedModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    AuditLogModule,
    HttpRequestLogModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: OriginGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
  ],
})
export class AppModule {}
