import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import { withSignal } from '@/lib/react-query';
import { getMe, getUser, listUsers } from '@/services/users.service';
import type { AdminUserListItem, ListUsersQuery, Paginated, UserProfile } from '@/types';

export const USERS_QUERY_KEYS = {
  all: ['users'] as const,
  me: ['users', 'me'] as const,
  detail: (id: string) => ['users', 'detail', id] as const,
  adminList: (query: ListUsersQuery) => ['users', 'admin-list', query] as const,
};

export function meQueryOptions(initialData?: UserProfile) {
  return queryOptions({
    queryKey: USERS_QUERY_KEYS.me,
    queryFn: withSignal(getMe),
    initialData,
  });
}

export function userDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: USERS_QUERY_KEYS.detail(id),
    queryFn: withSignal(getUser, id),
    enabled: id.length > 0,
  });
}

export function usersListQueryOptions(
  query: ListUsersQuery,
  initialData?: Paginated<AdminUserListItem>,
) {
  return queryOptions({
    queryKey: USERS_QUERY_KEYS.adminList(query),
    queryFn: withSignal(listUsers, query),
    placeholderData: keepPreviousData,
    initialData,
  });
}
