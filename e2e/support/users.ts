import { randomUUID } from 'node:crypto';

/** An address that cannot collide with another test or with the seeded admin. */
export function uniqueEmail(): string {
  return `e2e+${randomUUID()}@example.test`;
}
