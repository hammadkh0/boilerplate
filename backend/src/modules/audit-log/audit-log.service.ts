import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';

import {
  buildCursorArgs,
  buildCursorResult,
  buildSearchWhere,
  PRISMA_TX_OPTIONS,
} from '../shared/helpers';
import { PrismaService } from '../shared/prisma/prisma.service';
import type { CursorPaginatedResult, SortOrder } from '../shared/types';
import { SORT_ORDER } from '../shared/constants';
import { AUDIT_LOG_SEARCH_FIELDS } from './constants';
import type { ListAuditLogsQueryDto } from './dto';
import { AUDIT_LOG_LIST_SELECT, type AuditLogListItem } from './types';

export type AuditRecordInput = {
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
  ip?: string;
};

/**
 * Writes admin actions in the same transaction as the change, and lists them newest first.
 * The list uses cursor pagination because the table only grows.
 */
@Injectable()
export class AuditLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(db: Prisma.TransactionClient, entry: AuditRecordInput): Promise<void> {
    await db.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        metadata: entry.metadata,
        ip: entry.ip?.slice(0, 64),
      },
    });
  }

  async list(query: ListAuditLogsQueryDto): Promise<CursorPaginatedResult<AuditLogListItem>> {
    const sortOrder: SortOrder = query.sortOrder ?? SORT_ORDER.DESC;
    const where: Prisma.AuditLogWhereInput = {
      ...buildSearchWhere(query.search, AUDIT_LOG_SEARCH_FIELDS),
      ...(query.actorId ? { actorId: query.actorId } : {}),
      ...(query.action ? { action: query.action } : {}),
      ...(query.entityType ? { entityType: query.entityType } : {}),
      ...this.createdRange(query.from, query.to),
    };

    const rows = await this.prisma.auditLog.findMany({
      where,
      select: {
        ...AUDIT_LOG_LIST_SELECT,
        actor: { select: { id: true, fullName: true, deletedAt: true } },
      },
      orderBy: [{ createdAt: sortOrder }, { id: sortOrder }],
      ...buildCursorArgs({ cursor: query.cursor, limit: query.limit }),
    });

    // Prisma rejects `where` on this required to-one select, so deleted actors are hidden here.
    const visible = rows.map((row) => {
      const { deletedAt, ...actor } = row.actor;
      return {
        ...row,
        actor: deletedAt ? { id: actor.id, fullName: '' } : actor,
      };
    });

    return buildCursorResult(visible, query.limit);
  }

  transactionOptions(): typeof PRISMA_TX_OPTIONS {
    return PRISMA_TX_OPTIONS;
  }

  private createdRange(from?: string, to?: string): Prisma.AuditLogWhereInput {
    if (!from && !to) {
      return {};
    }
    return {
      createdAt: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      },
    };
  }
}
