import type { Role } from '@prisma/client';

import type { SORT_ORDER, TIME_FILTERS } from '../constants';

export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];

export type TimeFilter = (typeof TIME_FILTERS)[keyof typeof TIME_FILTERS];

export type AuthUser = {
  id: string;
  role: Role;
  tokenVersion: number;
};

export type JwtPayload = {
  sub: string;
  role: Role;
  tv: number;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    statusCode: number;
    message: string;
    details?: string[];
  };
};

export type OffsetPaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResult<T> = {
  items: T[];
  meta: OffsetPaginationMeta;
};

export type CursorPaginationMeta = {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
};

export type CursorPaginatedResult<T> = {
  items: T[];
  meta: CursorPaginationMeta;
};

export type CalendarMonthRanges = {
  thisMonthStart: Date;
  thisMonthEnd: Date;
  lastMonthStart: Date;
  lastMonthEnd: Date;
};

export type CalendarDateRangeBounds = {
  gte: Date;
  lte: Date;
};

export type DateRange = {
  start: Date;
  end: Date;
};
