import type { ListUsersQuery, SortOrder, UserRole, UserStatus } from '@/types';

function dayStart(value: string): string | undefined {
  return value ? `${value}T00:00:00.000Z` : undefined;
}

/** A date-only "to" value would stop at midnight and hide the rest of that day. */
function dayEnd(value: string): string | undefined {
  return value ? `${value}T23:59:59.999Z` : undefined;
}

export function toUsersListQuery(state: {
  page: number;
  limit: number;
  search: string;
  sortBy: string;
  sortOrder: SortOrder;
  role: UserRole | null;
  status: UserStatus | null;
  emailVerified: 'true' | 'false' | null;
  createdFrom: string;
  createdTo: string;
}): ListUsersQuery {
  return {
    page: state.page,
    limit: state.limit,
    search: state.search || undefined,
    sortBy: state.sortBy || undefined,
    sortOrder: state.sortBy ? state.sortOrder : undefined,
    role: state.role ?? undefined,
    status: state.status ?? undefined,
    emailVerified:
      state.emailVerified === 'true' ? true : state.emailVerified === 'false' ? false : undefined,
    createdFrom: dayStart(state.createdFrom),
    createdTo: dayEnd(state.createdTo),
  };
}
