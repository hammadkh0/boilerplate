import { parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server';

import { AUDIT_ACTION, DEFAULT_PAGE_SIZE, SORT_ORDER } from '@/constants';

const sortOrders = [SORT_ORDER.ASC, SORT_ORDER.DESC] as const;
const actions = [
  AUDIT_ACTION.USER_SUSPENDED,
  AUDIT_ACTION.USER_ACTIVATED,
  AUDIT_ACTION.USER_SOFT_DELETED,
] as const;

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
