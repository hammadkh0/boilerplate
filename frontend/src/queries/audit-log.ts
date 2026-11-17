import { infiniteQueryOptions } from '@tanstack/react-query';

import { listAuditLogs } from '@/services/audit-log.service';
import type { ListAuditLogsQuery } from '@/types';

export const AUDIT_LOG_QUERY_KEYS = {
  all: ['audit-log'] as const,
  list: (query: Omit<ListAuditLogsQuery, 'cursor'>) => ['audit-log', 'list', query] as const,
};

export function auditLogInfiniteQueryOptions(query: Omit<ListAuditLogsQuery, 'cursor'>) {
  return infiniteQueryOptions({
    queryKey: AUDIT_LOG_QUERY_KEYS.list(query),
    queryFn: ({ pageParam, signal }) => listAuditLogs({ ...query, cursor: pageParam }, { signal }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
  });
}
