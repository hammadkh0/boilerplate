import 'server-only';

import { serverFetch } from '@/services/http/server';
import type { AuditLogItem, CursorPage, ListAuditLogsQuery } from '@/types';

function toSearch(query: ListAuditLogsQuery): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }
  const search = params.toString();
  return search ? `?${search}` : '';
}

export function listAuditLogsServer(query: ListAuditLogsQuery): Promise<CursorPage<AuditLogItem>> {
  return serverFetch<CursorPage<AuditLogItem>>(`/audit-logs${toSearch(query)}`, {
    cache: 'no-store',
  });
}
