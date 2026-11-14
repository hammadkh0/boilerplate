import type { CookieOptions } from 'express';

import { COOKIE_NAMES, COOKIE_PATHS } from '../../shared/constants';

/** Cookie flags for the access and refresh tokens. `secure` is on in production only. */
export function authCookieOptions(
  secure: boolean,
  accessTtlMs: number,
  refreshTtlMs: number,
): { access: CookieOptions; refresh: CookieOptions } {
  const shared = { httpOnly: true, secure, sameSite: 'lax' as const };
  return {
    access: { ...shared, path: COOKIE_PATHS.ACCESS_TOKEN, maxAge: accessTtlMs },
    refresh: { ...shared, path: COOKIE_PATHS.REFRESH_TOKEN, maxAge: refreshTtlMs },
  };
}

export function clearAuthCookieOptions(secure: boolean): {
  access: CookieOptions;
  refresh: CookieOptions;
} {
  const shared = { httpOnly: true, secure, sameSite: 'lax' as const };
  return {
    access: { ...shared, path: COOKIE_PATHS.ACCESS_TOKEN },
    refresh: { ...shared, path: COOKIE_PATHS.REFRESH_TOKEN },
  };
}

export function readCookie(
  cookies: Record<string, unknown> | undefined,
  name: (typeof COOKIE_NAMES)[keyof typeof COOKIE_NAMES],
): string | undefined {
  const value = cookies?.[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
