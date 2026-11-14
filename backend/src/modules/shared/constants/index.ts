export const API_GLOBAL_PREFIX = 'api/v1';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export const COOKIE_PATHS = {
  ACCESS_TOKEN: '/',
  REFRESH_TOKEN: `/${API_GLOBAL_PREFIX}/auth`,
} as const;

export const BCRYPT_COST = 12;

export const PAGINATION_DEFAULT_LIMIT = 20;
export const PAGINATION_MAX_LIMIT = 100;

export const SORT_ORDER = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export const TIME_FILTERS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last7days',
  LAST_30_DAYS: 'last30days',
  LAST_MONTH: 'lastmonth',
  CUSTOM: 'custom',
} as const;

export const ENVIRONMENTS = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
  TEST: 'test',
} as const;

/** bcrypt only reads the first 72 bytes, so passwords stop at 72 characters. */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;

export const TIME_HH_MM_REGEX = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Accepts UUID versions 1 through 8, including version 7 ids stored in Postgres. */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const LOCALE_PATTERN = /^[a-zA-Z]{2,8}(-[a-zA-Z0-9]{1,8})*$/;

export const DEFAULT_LOCALE = 'en';

export const LOCALES = {
  ENGLISH: 'en',
} as const;

/**
 * Replace this list when a project serves specific countries.
 * `code` is ISO 3166-1 alpha-2. `locale` is the primary content locale.
 */
export const SUPPORTED_COUNTRIES = [
  { code: 'US', name: 'United States', locale: 'en', timezone: 'America/New_York' },
  { code: 'GB', name: 'United Kingdom', locale: 'en', timezone: 'Europe/London' },
] as const;

export const SUPPORTED_COUNTRY_CODES: string[] = SUPPORTED_COUNTRIES.map((country) => country.code);

export const DEFAULT_COUNTRY_TIMEZONE = 'UTC';

export const DOC_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'] as const;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const JSON_BODY_LIMIT = '1mb';

export const MEDIA_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

export const MEDIA_EXTENSION_MIME = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
} as const satisfies Record<string, (typeof MEDIA_ALLOWED_TYPES)[number]>;

export const SPREADSHEET_ALLOWED_TYPES = [
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
] as const;

export const SPREADSHEET_EXTENSIONS = ['.csv', '.xlsx', '.xls'] as const;

export const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Compared case-insensitively by the log redaction helpers. */
export const SENSITIVE_LOG_KEYS = [
  'password',
  'passwordhash',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'cookie',
  'setcookie',
  'secret',
  'apikey',
  'resetlink',
] as const;

export const SENSITIVE_LOG_HEADERS = [
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
] as const;

export const REDACTED_LOG_VALUE = '[REDACTED]';

export const PRISMA_TRANSACTION = {
  MAX_WAIT_MS: 5_000,
  TIMEOUT_MS: 10_000,
} as const;

export const IS_PUBLIC_KEY = 'isPublic';
export const ROLES_KEY = 'roles';
