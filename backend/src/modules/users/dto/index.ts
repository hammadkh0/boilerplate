import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role, UserStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { IsOptionalNonNull } from '../../shared/decorators';
import { PaginationQueryDto } from '../../shared/dto';
import { parseBoolean } from '../../shared/utils';

export class ListUsersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @ApiPropertyOptional({ enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    parseBoolean(typeof value === 'string' || typeof value === 'boolean' ? value : undefined),
  )
  @IsBoolean()
  emailVerified?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  @MaxLength(40)
  createdFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  @MaxLength(40)
  createdTo?: string;
}

export class UpdateProfileDto {
  @ApiPropertyOptional({ maxLength: 120 })
  @IsOptionalNonNull()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  fullName?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ enum: UserStatus })
  @IsEnum(UserStatus)
  declare status: UserStatus;
}
