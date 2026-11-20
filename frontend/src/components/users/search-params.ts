import { parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server';

import { DEFAULT_PAGE_SIZE, SORT_ORDER, USER_ROLE, USER_STATUS } from '@/constants';

const sortOrders = [SORT_ORDER.ASC, SORT_ORDER.DESC] as const;
const roles = [USER_ROLE.USER, USER_ROLE.SUPER_ADMIN] as const;
const statuses = [USER_STATUS.ACTIVE, USER_STATUS.SUSPENDED] as const;
const verified = ['true', 'false'] as const;

export const usersSearchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  search: parseAsString.withDefault(''),
  sortBy: parseAsString.withDefault(''),
  sortOrder: parseAsStringEnum([...sortOrders]).withDefault(SORT_ORDER.DESC),
  role: parseAsStringEnum([...roles]),
  status: parseAsStringEnum([...statuses]),
  emailVerified: parseAsStringEnum([...verified]),
  createdFrom: parseAsString.withDefault(''),
  createdTo: parseAsString.withDefault(''),
};
