import { calendarDateEnd, calendarDateStart } from '@/lib/date';
import type { ListUsersQuery, SortOrder, UserRole, UserStatus } from '@/types';

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
    createdFrom: calendarDateStart(state.createdFrom),
    createdTo: calendarDateEnd(state.createdTo),
  };
}
