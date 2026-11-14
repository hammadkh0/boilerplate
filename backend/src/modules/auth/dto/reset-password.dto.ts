import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength, Validate } from 'class-validator';

import { PasswordsMatchConstraint } from '../../shared/validators';
import { AUTH_PASSWORD_PATTERN } from '../constants';

export class ResetPasswordDto {
  @ApiProperty({ maxLength: 128 })
  @IsString()
  @MinLength(32)
  @MaxLength(128)
  declare token: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(AUTH_PASSWORD_PATTERN, {
    message: 'Password must be 8 to 72 characters and include upper, lower, and a number',
  })
  declare password: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Validate(PasswordsMatchConstraint)
  declare confirmPassword: string;
}
