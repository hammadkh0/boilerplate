import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { Roles } from '../shared/decorators';
import { AuditLogService } from './audit-log.service';
import { ListAuditLogsQueryDto } from './dto';

@ApiTags('audit-log')
@Controller('audit-logs')
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * Lists audit events for the admin table.
   * Uses cursor pagination, newest first, with no total count.
   */
  @Get()
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'List audit log entries' })
  @ApiOkResponse({ description: 'A cursor page of audit events' })
  list(@Query() query: ListAuditLogsQueryDto) {
    return this.auditLogService.list(query);
  }
}
