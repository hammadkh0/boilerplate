import { NextResponse, type NextRequest } from 'next/server';

import { getServerEnv } from '@/config/server-env';
import { API_PREFIX, COOKIE_NAMES, ROUTES } from '@/constants';
import { sanitizeRedirectPath } from '@/lib/utils';

const PROTECTED_PREFIXES = ['/admin', '/account'];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function loginRedirect(request: NextRequest): NextResponse {
  const nextPath = sanitizeRedirectPath(`${request.nextUrl.pathname}${request.nextUrl.search}`);
  const loginUrl = new URL(ROUTES.LOGIN, request.url);
  if (nextPath) {
    loginUrl.searchParams.set('next', nextPath);
  }
  return NextResponse.redirect(loginUrl);
}

/**
 * Sends signed-out visitors away from the account and admin areas.
 * When the access cookie is missing and a refresh cookie is present, refreshes the session first.
 */
export async function proxy(request: NextRequest) {
  if (!isProtected(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
  if (!refreshToken) {
    return loginRedirect(request);
  }

  const { BACKEND_URL } = getServerEnv();
  const refreshResponse = await fetch(`${BACKEND_URL}${API_PREFIX}/auth/refresh`, {
    method: 'POST',
    headers: { cookie: request.headers.get('cookie') ?? '' },
  });

  if (!refreshResponse.ok) {
    return loginRedirect(request);
  }

  const setCookies = refreshResponse.headers.getSetCookie();
  const requestHeaders = new Headers(request.headers);
  const cookieUpdates = setCookies
    .map((cookie) => cookie.split(';')[0])
    .filter((part): part is string => Boolean(part));
  const existing = requestHeaders.get('cookie');
  requestHeaders.set('cookie', [existing, ...cookieUpdates].filter(Boolean).join('; '));

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const cookie of setCookies) {
    response.headers.append('set-cookie', cookie);
  }
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/account/:path*'],
};
