import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

import {
  PAGINATION_DEFAULT_LIMIT,
  PAGINATION_MAX_LIMIT,
  SORT_ORDER,
  TIME_FILTERS,
} from '../constants';
import type { SortOrder, TimeFilter } from '../types';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({
    default: PAGINATION_DEFAULT_LIMIT,
    minimum: 1,
    maximum: PAGINATION_MAX_LIMIT,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  @IsOptional()
  limit: number = PAGINATION_DEFAULT_LIMIT;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  sortBy?: string;

  @ApiPropertyOptional({ enum: SORT_ORDER })
  @IsOptional()
  @IsEnum(SORT_ORDER)
  sortOrder?: SortOrder;
}

export class CursorPaginationQueryDto {
  @ApiPropertyOptional({ description: 'Id of the last row from the previous page' })
  @IsOptional()
  @IsUUID('7')
  cursor?: string;

  @ApiPropertyOptional({
    default: PAGINATION_DEFAULT_LIMIT,
    minimum: 1,
    maximum: PAGINATION_MAX_LIMIT,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PAGINATION_MAX_LIMIT)
  @IsOptional()
  limit: number = PAGINATION_DEFAULT_LIMIT;

  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @ApiPropertyOptional({ enum: SORT_ORDER, default: SORT_ORDER.DESC })
  @IsOptional()
  @IsEnum(SORT_ORDER)
  sortOrder?: SortOrder;
}

export class DateRangeQueryDto {
  @ApiProperty({ enum: TIME_FILTERS })
  @IsEnum(TIME_FILTERS)
  declare timeFilter: TimeFilter;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(40)
  endDate?: string;
}
