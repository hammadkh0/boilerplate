import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { API_PREFIX, ROUTES } from '@/constants';
import { getServerEnv } from '@/config/server-env';
import { ApiError, isFailure, unwrapEnvelope } from '@/lib/http';

type ServerFetchInit = {
  method?: 'GET' | 'POST';
  cache?: RequestCache;
  tags?: string[];
  revalidate?: number;
  signal?: AbortSignal;
};

/**
 * Server-side read through `fetch`, so Next can cache or opt out.
 * Forwards the incoming cookies. Admin and account reads should pass `cache: 'no-store'`.
 * A 401 means the session was revoked or expired, so it redirects to the login page.
 * A 403 redirects to the account page, because pages render in parallel with the admin layout gate.
 */
export async function serverFetch<T>(path: string, init: ServerFetchInit = {}): Promise<T> {
  const { BACKEND_URL } = getServerEnv();
  const cookieStore = await cookies();
  const cookie = cookieStore
    .getAll()
    .map((entry) => `${entry.name}=${entry.value}`)
    .join('; ');

  const response = await fetch(`${BACKEND_URL}${API_PREFIX}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    cache: init.cache ?? 'no-store',
    signal: init.signal,
    next: {
      ...(init.tags ? { tags: init.tags } : {}),
      ...(init.revalidate !== undefined ? { revalidate: init.revalidate } : {}),
    },
  });

  if (response.status === 401) {
    redirect(ROUTES.LOGIN);
  }
  if (response.status === 403) {
    redirect(ROUTES.ACCOUNT);
  }

  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok && !isFailure(body)) {
    throw new ApiError(response.status, 'Request failed');
  }
  return unwrapEnvelope<T>(body);
}
