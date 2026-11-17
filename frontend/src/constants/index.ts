export const ROUTES = {
  HOME: '/',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  THANK_YOU: '/thank-you',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  VERIFY_EMAIL: '/verify-email',
  ACCOUNT: '/account',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_AUDIT_LOG: '/admin/audit-log',
  ADMIN_PROFILE: '/admin/profile',
} as const;

export const USER_ROLE = {
  USER: 'USER',
  SUPER_ADMIN: 'SUPER_ADMIN',
} as const;

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const ADMIN_PORTAL_ROLES = [USER_ROLE.SUPER_ADMIN] as const;

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const DEFAULT_PAGE_SIZE = 20;

export const SEARCH_DEBOUNCE_MS = 350;

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const API_PREFIX = '/api/v1';

/** Matches the backend email cooldown so the resend button does not hammer the API. */
export const RESEND_COOLDOWN_MS = 60_000;

export const PRIVATE_PAGE_ROBOTS = {
  index: false,
  follow: false,
} as const;
