import 'server-only';

import { serverFetch } from '@/services/http/server';
import type { AdminUserListItem, ListUsersQuery, Paginated, UserProfile } from '@/types';

function toSearch(query: ListUsersQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

export function getMeServer(): Promise<UserProfile> {
  return serverFetch<UserProfile>('/users/me', { cache: 'no-store' });
}

/** The signed-in user for server layouts. Admin pages use this for the role check. */
export const getCurrentUserServer = getMeServer;

export function listUsersServer(query: ListUsersQuery): Promise<Paginated<AdminUserListItem>> {
  return serverFetch<Paginated<AdminUserListItem>>(`/users${toSearch(query)}`, {
    cache: 'no-store',
  });
}
