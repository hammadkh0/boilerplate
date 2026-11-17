import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { AppConfigService } from '../config/app-config.service';
import { PrismaService } from '../shared/prisma/prisma.service';
import { HTTP_REQUEST_LOG_JOB, HTTP_REQUEST_LOG_RETENTION_DAYS } from './constants';
import { requestLogCutoff } from './helpers';

export type RequestLogInput = {
  method: string;
  path: string;
  statusCode: number;
  durationMs: number;
  ip?: string;
};

@Injectable()
export class HttpRequestLogService {
  private readonly logger = new Logger(HttpRequestLogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService,
  ) {}

  async write(entry: RequestLogInput): Promise<void> {
    await this.prisma.httpRequestLog.create({
      data: {
        method: entry.method.slice(0, 16),
        path: entry.path.slice(0, 512),
        statusCode: entry.statusCode,
        durationMs: entry.durationMs,
        ip: entry.ip?.slice(0, 64),
      },
    });
  }

  /** Deletes request logs older than the retention window. Safe to run more than once. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM, { name: HTTP_REQUEST_LOG_JOB })
  async deleteExpired(now = new Date()): Promise<void> {
    if (!this.config.httpRequestLogEnabled) {
      return;
    }
    const result = await this.prisma.httpRequestLog.deleteMany({
      where: { createdAt: { lt: requestLogCutoff(now, HTTP_REQUEST_LOG_RETENTION_DAYS) } },
    });
    if (result.count > 0) {
      this.logger.log(`Deleted ${result.count} expired request logs`);
    }
  }
}
