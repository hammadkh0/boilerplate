/**
 * Throws when `value` is `undefined`.
 * Use this for owner and tenant ids before they go into a Prisma `where`.
 * Prisma drops `undefined` filters, which would match every row.
 */
export function requireDefined<T>(value: T | undefined, name: string): T {
  if (value === undefined) {
    throw new Error(`${name} is required`);
  }
  return value;
}

/**
 * PATCH payload for Postgres.
 * Keeps `null`, which clears a column, and drops `undefined`, which leaves a column unchanged.
 */
export function buildPatchData<T extends Record<string, unknown>>(dto: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(dto).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
