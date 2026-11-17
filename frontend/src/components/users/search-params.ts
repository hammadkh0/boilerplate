import { parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server';

import { AUDIT_ACTION, DEFAULT_PAGE_SIZE, SORT_ORDER, USER_ROLE, USER_STATUS } from '@/constants';

const sortOrders = [SORT_ORDER.ASC, SORT_ORDER.DESC] as const;
const roles = [USER_ROLE.USER, USER_ROLE.SUPER_ADMIN] as const;
const statuses = [USER_STATUS.ACTIVE, USER_STATUS.SUSPENDED] as const;
const verified = ['true', 'false'] as const;
const actions = [
  AUDIT_ACTION.USER_SUSPENDED,
  AUDIT_ACTION.USER_ACTIVATED,
  AUDIT_ACTION.USER_SOFT_DELETED,
] as const;

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

export const auditSearchParams = {
  search: parseAsString.withDefault(''),
  sortOrder: parseAsStringEnum([...sortOrders]).withDefault(SORT_ORDER.DESC),
  actorId: parseAsString.withDefault(''),
  action: parseAsStringEnum([...actions]),
  entityType: parseAsString.withDefault(''),
  from: parseAsString.withDefault(''),
  to: parseAsString.withDefault(''),
  limit: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
};
