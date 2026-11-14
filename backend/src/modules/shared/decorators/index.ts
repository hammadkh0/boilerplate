import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
import { ValidateIf, type ValidationOptions } from 'class-validator';

import { IS_PUBLIC_KEY, ROLES_KEY } from '../constants';
import type { AuthUser } from '../types';

/** Marks a route as anonymous. The global JWT guard skips it. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/** Lists the roles allowed to call an admin handler. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

/** The signed-in user attached by the JWT strategy. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);

/**
 * Allows a field to be omitted, and rejects `null`.
 * `@IsOptional()` lets `null` through, which would clear a required column.
 */
export function IsOptionalNonNull(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateIf((_object: object, value: unknown) => value !== undefined, validationOptions);
}
