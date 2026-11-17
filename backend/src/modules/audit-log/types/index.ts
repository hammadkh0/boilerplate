import type { Prisma } from '@prisma/client';

export const AUDIT_LOG_LIST_SELECT = {
  id: true,
  actorId: true,
  action: true,
  entityType: true,
  entityId: true,
  metadata: true,
  ip: true,
  createdAt: true,
  actor: {
    select: { id: true, fullName: true },
  },
} satisfies Prisma.AuditLogSelect;

export type AuditLogListItem = Prisma.AuditLogGetPayload<{ select: typeof AUDIT_LOG_LIST_SELECT }>;
