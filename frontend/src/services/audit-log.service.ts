import { api } from '@/services/http/client';
import { unwrapEnvelope } from '@/lib/http';
import type { AuditLogItem, CursorPage, ListAuditLogsQuery, ServiceRequestOptions } from '@/types';

export function listAuditLogs(
  query: ListAuditLogsQuery,
  options?: ServiceRequestOptions,
): Promise<CursorPage<AuditLogItem>> {
  return api
    .get('/audit-logs', { params: query, signal: options?.signal })
    .then((response) => unwrapEnvelope(response.data));
}
