import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString, Matches, MaxLength, MinLength, Validate } from 'class-validator';

import { PasswordsMatchConstraint } from '../../shared/validators';
import { AUTH_PASSWORD_PATTERN } from '../constants';

export class RegisterDto {
  @ApiProperty({ example: 'ada@example.com', maxLength: 254 })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(254)
  declare email: string;

  @ApiProperty({ maxLength: 120 })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  declare fullName: string;

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
