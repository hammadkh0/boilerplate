import { createHash, randomBytes, randomInt } from 'node:crypto';

import { compare, hash } from 'bcrypt';
import { parsePhoneNumberWithError, type CountryCode } from 'libphonenumber-js/min';
import { UAParser } from 'ua-parser-js';

import { BCRYPT_COST, DEFAULT_COUNTRY_TIMEZONE, SUPPORTED_COUNTRIES } from '../constants';

/**
 * Hashes a password with bcrypt.
 * Cost defaults to 12. Callers that pass a cost must keep it at 12 or higher.
 */
export async function hashData(data: string, saltRounds: number = BCRYPT_COST): Promise<string> {
  return hash(data, saltRounds);
}

/** Compares a plaintext password with a bcrypt hash. */
export async function compareData(data: string, passwordHash: string): Promise<boolean> {
  return compare(data, passwordHash);
}

/**
 * SHA-256 hex digest for refresh, verification, and reset tokens.
 * bcrypt is the wrong hash here because it only reads the first 72 bytes.
 */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Parses query-string booleans. Empty and unknown values become `undefined`. */
export function parseBoolean(value: boolean | string | null | undefined): boolean | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (value.toLowerCase() === 'true') {
    return true;
  }
  if (value.toLowerCase() === 'false') {
    return false;
  }
  return undefined;
}

/**
 * Normalizes a phone number to E.164.
 * Numbers without a country code use `defaultRegion`, which comes from config.
 */
export function normalizePhoneNumber(
  value: string | null | undefined,
  defaultRegion: CountryCode,
): string | null {
  if (!value || typeof value !== 'string') {
    return null;
  }

  let cleaned = value.trim().replace(/[\s-]/g, '');
  if (!cleaned) {
    return null;
  }
  if (cleaned.startsWith('00')) {
    cleaned = `+${cleaned.slice(2)}`;
  }

  try {
    const phoneNumber = cleaned.startsWith('+')
      ? parsePhoneNumberWithError(cleaned)
      : parsePhoneNumberWithError(cleaned, defaultRegion);
    return phoneNumber.isValid() ? phoneNumber.format('E.164') : null;
  } catch {
    return null;
  }
}

/** Six-digit code from a cryptographic generator. */
export function generateOTP(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

/** Returns a one-time code and the UTC instant it stops being valid. */
export function generateOTPWithExpiry(minutes = 10): { otp: string; expiry: Date } {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + minutes);
  return { otp: generateOTP(), expiry };
}

export function stringify(
  value: unknown,
  options?: { trim?: boolean; objects?: 'json' | 'empty' },
): string {
  const trim = options?.trim ?? false;
  const objectMode = options?.objects ?? 'json';

  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'string') {
    return trim ? value.trim() : value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    const text = String(value);
    return trim ? text.trim() : text;
  }
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return objectMode === 'empty' ? '' : JSON.stringify(value);
  }
  return '';
}

/** Hex string of `byteLength` random bytes, so the string length is `byteLength * 2`. */
export function generateRandomString(byteLength: number): string {
  return randomBytes(byteLength).toString('hex');
}

type RequestLike = {
  socket?: { remoteAddress?: string };
  ip?: string;
};

/**
 * Express `request.ip`, which honours the `trust proxy` hop count set in `configure-app.ts`.
 * Raw forwarding headers are ignored because any client can set them.
 */
export function getClientIp(request: RequestLike): string | undefined {
  return request.ip || request.socket?.remoteAddress;
}

/** Browser, OS, and device summary for a user-agent string. */
export function getDeviceInfo(userAgent?: string): string | null {
  if (!userAgent) {
    return null;
  }

  const parser = new UAParser(userAgent);
  const device = parser.getDevice();
  const os = parser.getOS();
  const browser = parser.getBrowser();
  const parts = [
    browser.name && `${browser.name}${browser.version ? ` ${browser.version}` : ''}`,
    os.name && `${os.name}${os.version ? ` ${os.version}` : ''}`,
    device.vendor && `${device.vendor}${device.model ? ` ${device.model}` : ''}`,
    device.type && `(${device.type})`,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(' / ') : null;
}

/** Rounded to one decimal. Returns null when the previous value is 0 and the current value is not. */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) {
    return current === 0 ? 0 : null;
  }
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export function readStringField(item: Record<string, unknown>, field: string): string {
  const value = item[field];
  return typeof value === 'string' ? value : '';
}

export function readNumberField(item: Record<string, unknown>, field: string): number {
  const value = item[field];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

export function isSupportedCountry(code?: string | null): boolean {
  if (!code) {
    return false;
  }
  const normalized = code.trim().toUpperCase();
  return SUPPORTED_COUNTRIES.some((country) => country.code === normalized);
}

export function getCountryTimezone(code?: string | null): string {
  const normalized = code?.trim().toUpperCase();
  const match = SUPPORTED_COUNTRIES.find((country) => country.code === normalized);
  return match?.timezone ?? DEFAULT_COUNTRY_TIMEZONE;
}
