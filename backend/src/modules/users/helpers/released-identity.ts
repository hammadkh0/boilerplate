import { Prisma } from '@prisma/client';

const RELEASED_IDENTITY_MARK = 'deleted';

/** Replaces a deleted user's email so the original address can register again. */
export function tombstoneIdentityValue(userId: string, value: string): string {
  const original = originalIdentityValue(userId, value);
  return `${RELEASED_IDENTITY_MARK}.${userId}.${original}`;
}

export function originalIdentityValue(userId: string, value: string): string {
  const prefix = `${RELEASED_IDENTITY_MARK}.${userId}.`;
  return value.startsWith(prefix) ? value.slice(prefix.length) : value;
}

export function displayIdentityValue(userId: string, value: string | null): string | null {
  if (value === null) {
    return null;
  }
  return originalIdentityValue(userId, value);
}

export function releasedIdentityData(userId: string, email: string): Prisma.UserUpdateInput {
  return {
    email: tombstoneIdentityValue(userId, email),
    refreshTokenHash: null,
    emailVerificationTokenHash: null,
    emailVerificationExpiresAt: null,
    passwordResetTokenHash: null,
    passwordResetExpiresAt: null,
  };
}

type IdentityWriter = {
  user: {
    findMany: (args: Prisma.UserFindManyArgs) => Promise<Array<{ id: string; email: string }>>;
    update: (args: Prisma.UserUpdateArgs) => Promise<unknown>;
  };
};

/**
 * Frees the email on rows that are already soft-deleted.
 * Safe to call more than once. The lookup uses `deletedAt: { not: null }` because this runs on Postgres.
 */
export async function releaseDeletedUserIdentities(
  db: IdentityWriter,
  keys: { email?: string },
): Promise<void> {
  if (!keys.email) {
    return;
  }

  const occupants = await db.user.findMany({
    where: {
      deletedAt: { not: null },
      email: keys.email,
    },
    select: { id: true, email: true },
  });

  const occupant = occupants[0];
  if (!occupant) {
    return;
  }

  await db.user.update({
    where: { id: occupant.id },
    data: releasedIdentityData(occupant.id, occupant.email),
  });
}
