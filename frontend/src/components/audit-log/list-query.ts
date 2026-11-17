import { AUDIT_ACTION } from '@/constants';
import type { ListAuditLogsQuery, SortOrder } from '@/types';

function dayStart(value: string): string | undefined {
  return value ? `${value}T00:00:00.000Z` : undefined;
}

/** A date-only "to" value would stop at midnight and hide the rest of that day. */
function dayEnd(value: string): string | undefined {
  return value ? `${value}T23:59:59.999Z` : undefined;
}

const UUID_V7 = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function toAuditListQuery(state: {
  search: string;
  sortOrder: SortOrder;
  actorId: string;
  action: (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION] | null;
  entityType: string;
  from: string;
  to: string;
  limit: number;
}): Omit<ListAuditLogsQuery, 'cursor'> {
  return {
    search: state.search || undefined,
    sortOrder: state.sortOrder,
    actorId: UUID_V7.test(state.actorId) ? state.actorId : undefined,
    action: state.action ?? undefined,
    entityType: state.entityType || undefined,
    from: dayStart(state.from),
    to: dayEnd(state.to),
    limit: state.limit,
  };
}
