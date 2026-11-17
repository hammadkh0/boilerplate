import { ApiPropertyOptional } from '@nestjs/swagger';
import { AuditAction } from '@prisma/client';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

import { CursorPaginationQueryDto } from '../../shared/dto';

export class ListAuditLogsQueryDto extends CursorPaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('7')
  actorId?: string;

  @ApiPropertyOptional({ enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @ApiPropertyOptional({ maxLength: 64 })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  entityType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  @MaxLength(40)
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  @MaxLength(40)
  to?: string;
}
