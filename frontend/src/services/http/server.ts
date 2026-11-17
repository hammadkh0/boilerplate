import 'server-only';

import { cookies } from 'next/headers';

import { API_PREFIX } from '@/constants';
import { getServerEnv } from '@/config/server-env';
import { ApiError, unwrapEnvelope } from '@/lib/http';

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

  const body: unknown = await response.json().catch(() => undefined);
  if (!response.ok) {
    if (
      typeof body === 'object' &&
      body !== null &&
      'success' in body &&
      body.success === false &&
      'error' in body &&
      typeof body.error === 'object' &&
      body.error !== null &&
      'message' in body.error &&
      typeof body.error.message === 'string' &&
      'statusCode' in body.error &&
      typeof body.error.statusCode === 'number'
    ) {
      throw new ApiError(body.error.statusCode, body.error.message);
    }
    throw new ApiError(response.status, 'Request failed');
  }

  return unwrapEnvelope<T>(body);
}
