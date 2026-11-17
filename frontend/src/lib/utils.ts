export { cn } from 'cn';

/** Returns a copy without keys whose string values are blank. */
export function omitEmptyStringEntries(map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(map).filter(([, value]) => value.trim().length > 0));
}

/** Allows only same-site relative paths, so a redirect cannot leave this site. */
export function sanitizeRedirectPath(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('\\')) {
    return null;
  }
  return trimmed;
}

/** Parses query-string booleans. Empty and unknown values become undefined. */
export function parseBoolean(value: boolean | string | null | undefined): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') {
    return true;
  }
  if (normalized === 'false' || normalized === '0') {
    return false;
  }
  return undefined;
}
