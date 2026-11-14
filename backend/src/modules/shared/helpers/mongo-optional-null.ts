/**
 * MongoDB only. Optional fields are often missing, and `{ field: null }` does not match a missing field.
 * Postgres queries should compare with `null` directly.
 */
export function unsetOrNull(field: string): { OR: Record<string, unknown>[] } {
  return {
    OR: [{ [field]: { isSet: false } }, { [field]: null }],
  };
}

export const NOT_REVOKED = unsetOrNull('revokedAt');
export const NOT_WITHDRAWN = unsetOrNull('withdrawnAt');
export const NOT_ACCEPTED = unsetOrNull('acceptedAt');
export const NOT_DELETED = unsetOrNull('deletedAt');
export const NOT_READ = unsetOrNull('readAt');
