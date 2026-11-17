import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';

import { HttpRequestLogInterceptor } from './http-request-log.interceptor';
import { HttpRequestLogService } from './http-request-log.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    HttpRequestLogService,
    { provide: APP_INTERCEPTOR, useClass: HttpRequestLogInterceptor },
  ],
})
export class HttpRequestLogModule {}
