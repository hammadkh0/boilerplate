import { ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export function isPrismaUniqueConstraintError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

export function prismaUniqueConstraintField(
  error: Prisma.PrismaClientKnownRequestError,
): string | undefined {
  const target = error.meta?.target;
  if (typeof target === 'string') {
    return target;
  }
  if (Array.isArray(target)) {
    return target.map((entry) => String(entry)).join('_');
  }
  return undefined;
}

export function userUniqueConstraintMessage(field?: string): string {
  if (field?.includes('email')) {
    return 'An account with this email already exists.';
  }
  return 'An account with these details already exists.';
}

/** Maps a unique-constraint failure to a conflict, or returns null for any other error. */
export function toUserConflictException(error: unknown): ConflictException | null {
  if (!isPrismaUniqueConstraintError(error)) {
    return null;
  }
  return new ConflictException(userUniqueConstraintMessage(prismaUniqueConstraintField(error)));
}
