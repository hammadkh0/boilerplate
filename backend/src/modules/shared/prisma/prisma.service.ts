import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

import { AppConfigService } from '../../config/app-config.service';
import { createSoftDeleteClient } from './extensions/soft-delete';

/**
 * Prisma client for Postgres.
 * `withSoftDelete` is built once and reused. Use the plain client only when a read must include deleted rows.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly pool: Pool;
  private softDeleteClient: ReturnType<typeof createSoftDeleteClient> | undefined;

  constructor(config: AppConfigService) {
    const pool = new Pool({ connectionString: config.databaseUrl });
    super({ adapter: new PrismaPg(pool) });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }

  get withSoftDelete(): ReturnType<typeof createSoftDeleteClient> {
    this.softDeleteClient ??= createSoftDeleteClient(this);
    return this.softDeleteClient;
  }
}
