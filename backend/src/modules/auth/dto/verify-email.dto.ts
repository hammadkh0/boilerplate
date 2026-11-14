import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ maxLength: 128 })
  @IsString()
  @MinLength(32)
  @MaxLength(128)
  declare token: string;
}
