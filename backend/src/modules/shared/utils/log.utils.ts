import { REDACTED_LOG_VALUE, SENSITIVE_LOG_HEADERS, SENSITIVE_LOG_KEYS } from '../constants';
import { stringify } from './data.utils';

function normalizeKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, '').toLowerCase();
}

const SENSITIVE_KEY_SET = new Set<string>(SENSITIVE_LOG_KEYS);
const SENSITIVE_HEADER_SET = new Set<string>(SENSITIVE_LOG_HEADERS);

/**
 * Replaces sensitive keys with a placeholder, walking nested objects and arrays.
 * Key matching ignores case and non-alphanumeric characters.
 */
export function sanitizeObject(
  value: unknown,
  sensitiveFields: readonly string[] = SENSITIVE_LOG_KEYS,
): unknown {
  const fields = new Set(sensitiveFields.map((field) => normalizeKey(field)));

  const walk = (current: unknown): unknown => {
    if (current === null || current === undefined) {
      return current;
    }
    if (Array.isArray(current)) {
      return current.map((item) => walk(item));
    }
    if (typeof current !== 'object') {
      return current;
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(current)) {
      if (fields.has(normalizeKey(key))) {
        sanitized[key] = REDACTED_LOG_VALUE;
      } else {
        sanitized[key] = walk(entry);
      }
    }
    return sanitized;
  };

  return walk(value);
}

/** Redacts sensitive HTTP headers. Other headers are copied as strings. */
export function sanitizeHeaders(
  headers: Record<string, unknown>,
  sensitiveHeaders: readonly string[] = SENSITIVE_LOG_HEADERS,
): Record<string, string> {
  const blocked = new Set(sensitiveHeaders.map((header) => header.toLowerCase()));
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(headers)) {
    if (blocked.has(key.toLowerCase())) {
      sanitized[key] = REDACTED_LOG_VALUE;
      continue;
    }
    if (value !== undefined && value !== null) {
      sanitized[key] = stringify(value, { trim: true });
    }
  }

  return sanitized;
}

export function truncateString(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength)}... [TRUNCATED]`;
}

/** Returns the object when its JSON fits, otherwise a short preview. */
export function truncateObject(value: unknown, maxLength: number): unknown {
  const serialized = JSON.stringify(value);
  if (serialized.length <= maxLength) {
    return value;
  }
  return { truncated: true, preview: truncateString(serialized, maxLength) };
}

/**
 * Converts dates, bigints, and `toJSON` values into JSON-safe data.
 * Functions are dropped.
 */
export function serializeForJson(value: unknown): unknown {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeForJson(item));
  }
  if (typeof value === 'object') {
    const withToJson = value as { toJSON?: () => unknown };
    if (typeof withToJson.toJSON === 'function' && value.constructor !== Object) {
      return serializeForJson(withToJson.toJSON());
    }

    const result: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value)) {
      if (typeof entry === 'function') {
        continue;
      }
      result[key] = serializeForJson(entry);
    }
    return result;
  }

  return value;
}

export function isSensitiveLogKey(key: string): boolean {
  return SENSITIVE_KEY_SET.has(normalizeKey(key));
}

export function isSensitiveLogHeader(header: string): boolean {
  return SENSITIVE_HEADER_SET.has(header.toLowerCase());
}

/** Pino redact paths for the shared sensitive-key list. */
export function buildPinoRedactPaths(): string[] {
  const bodyPaths = SENSITIVE_LOG_KEYS.map((key) => `req.body.${key}`);
  return [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.headers["set-cookie"]',
    'res.headers["set-cookie"]',
    ...bodyPaths,
  ];
}
