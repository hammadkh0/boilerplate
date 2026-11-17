import type { SORT_ORDER, USER_ROLE, USER_STATUS } from '@/constants';

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
export type UserStatus = (typeof USER_STATUS)[keyof typeof USER_STATUS];
export type SortOrder = (typeof SORT_ORDER)[keyof typeof SORT_ORDER];

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

export type ServiceRequestOptions = {
  signal?: AbortSignal;
};

export type OffsetMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  meta: OffsetMeta;
};

export type CursorMeta = {
  nextCursor: string | null;
  hasMore: boolean;
  limit: number;
};

export type CursorPage<T> = {
  items: T[];
  meta: CursorMeta;
};

export type UserProfile = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: string | null;
  createdAt: string;
  avatarUrl: string | null;
};

export type AdminUserListItem = {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  emailVerifiedAt: string | null;
  createdAt: string;
};

export type ListUsersQuery = {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  role?: UserRole;
  status?: UserStatus;
  emailVerified?: boolean;
  createdFrom?: string;
  createdTo?: string;
};

export type DashboardKpis = {
  totalUsers: number;
  newUsersThisWeek: number;
  verifiedPercentage: number;
  suspendedCount: number;
};

export type AuditLogItem = {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata: unknown;
  ip: string | null;
  createdAt: string;
  actor: { id: string; fullName: string };
};

export type ListAuditLogsQuery = {
  cursor?: string;
  limit?: number;
  search?: string;
  sortOrder?: SortOrder;
  actorId?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
};
