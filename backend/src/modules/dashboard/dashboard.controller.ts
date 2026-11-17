import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { Roles } from '../shared/decorators';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'User counts for the admin dashboard' })
  @ApiOkResponse({ description: 'Total, new this week, verified percentage, and suspended count' })
  getKpis() {
    return this.dashboardService.getKpis();
  }
}
