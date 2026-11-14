import { BadRequestException } from '@nestjs/common';

import { PAGINATION_MAX_LIMIT, SORT_ORDER } from '../constants';
import type { CursorPaginatedResult, PaginatedResult, SortOrder } from '../types';

type PageQuery = {
  page: number;
  limit: number;
};

/**
 * Skip and take for an offset page.
 * `limit` is clamped to the shared maximum so a query cannot request an unbounded page.
 */
export function buildPaginationArgs(query: PageQuery): { skip: number; take: number } {
  const take = Math.min(Math.max(query.limit, 1), PAGINATION_MAX_LIMIT);
  const page = Math.max(query.page, 1);
  return { skip: (page - 1) * take, take };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  const safeLimit = Math.max(limit, 1);
  return {
    items,
    meta: {
      page,
      limit: safeLimit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / safeLimit),
    },
  };
}

/**
 * Cursor page arguments. Fetches one extra row so the caller can tell whether another page exists.
 * The cursor is the id of the last row already returned.
 */
export function buildCursorArgs(input: { cursor?: string; limit: number }): {
  take: number;
  skip?: number;
  cursor?: { id: string };
} {
  const take = Math.min(Math.max(input.limit, 1), PAGINATION_MAX_LIMIT) + 1;
  if (!input.cursor) {
    return { take };
  }
  return { take, skip: 1, cursor: { id: input.cursor } };
}

export function buildCursorResult<T extends { id: string }>(
  rows: T[],
  limit: number,
): CursorPaginatedResult<T> {
  const safeLimit = Math.min(Math.max(limit, 1), PAGINATION_MAX_LIMIT);
  const hasMore = rows.length > safeLimit;
  const items = hasMore ? rows.slice(0, safeLimit) : rows;
  const lastItem = items[items.length - 1];
  return {
    items,
    meta: {
      nextCursor: hasMore && lastItem ? lastItem.id : null,
      hasMore,
      limit: safeLimit,
    },
  };
}

/** Case-insensitive OR across `fields`. An empty search returns an empty filter. */
export function buildSearchWhere(
  search: string | undefined,
  fields: readonly string[],
): { OR: Record<string, { contains: string; mode: 'insensitive' }>[] } | Record<string, never> {
  const term = search?.trim();
  if (!term || fields.length === 0) {
    return {};
  }

  return {
    OR: fields.map((field) => ({
      [field]: { contains: term, mode: 'insensitive' as const },
    })),
  };
}

/**
 * Order by a whitelisted column.
 * Throws BadRequestException when `sortBy` is outside `whitelist`.
 */
export function buildOrderBy<T extends string>(
  sortBy: string | undefined,
  sortOrder: SortOrder | undefined,
  whitelist: readonly T[],
  fallback: Partial<Record<T, SortOrder>>,
): Record<string, SortOrder> {
  const fallbackField = Object.keys(fallback)[0] as T | undefined;
  const field = (sortBy ?? fallbackField) as T | undefined;
  if (!field || !whitelist.includes(field)) {
    throw new BadRequestException('Invalid sort field');
  }

  const direction = sortOrder ?? fallback[field] ?? SORT_ORDER.DESC;
  return { [field]: direction };
}
