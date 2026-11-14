import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength, Validate } from 'class-validator';

import { PasswordsMatchConstraint } from '../../shared/validators';
import { AUTH_PASSWORD_PATTERN } from '../constants';

export class ChangePasswordDto {
  @ApiProperty({ maxLength: 72 })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  declare currentPassword: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(AUTH_PASSWORD_PATTERN, {
    message: 'Password must be 8 to 72 characters and include upper, lower, and a number',
  })
  declare newPassword: string;

  @ApiProperty({ minLength: 8, maxLength: 72 })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Validate(PasswordsMatchConstraint)
  declare confirmPassword: string;
}
