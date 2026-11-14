import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { Public } from '../shared/decorators';
import { PrismaService } from '../shared/prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Reports whether the API process and the database are reachable.
   * Anonymous on purpose so load balancers can call it.
   */
  @Get()
  @Public()
  @HealthCheck()
  @ApiOperation({ summary: 'Health check' })
  @ApiOkResponse({ description: 'The API and the database are reachable' })
  check() {
    return this.health.check([
      async () => {
        await this.prisma.$queryRaw`SELECT 1`;
        return { database: { status: 'up' } };
      },
    ]);
  }
}
