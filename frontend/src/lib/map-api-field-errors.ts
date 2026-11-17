import type { FieldPath, FieldValues, UseFormSetError } from 'react-hook-form';

import { rethrowIfAbort, toApiError } from '@/lib/http';

const API_FORM_FIELDS = [
  'confirmPassword',
  'currentPassword',
  'newPassword',
  'fullName',
  'password',
  'email',
  'token',
] as const;

type ApiFormField = (typeof API_FORM_FIELDS)[number];

export type MappedApiErrors = {
  fields: Partial<Record<ApiFormField, string>>;
  formMessage: string | null;
};

/**
 * Splits a failed API response into field messages and one form-level message.
 * Longer field names are checked first so "confirmPassword" is not stored on "password".
 * Throws again when the request was aborted, so a cancellation is not shown as a form error.
 */
export function mapApiFieldErrors(error: unknown): MappedApiErrors {
  rethrowIfAbort(error);
  const apiError = toApiError(error);
  const fields: Partial<Record<ApiFormField, string>> = {};
  const unmatched: string[] = [];

  for (const detail of apiError.details ?? []) {
    const field = API_FORM_FIELDS.find((name) => detail.toLowerCase().includes(name.toLowerCase()));
    if (!field) {
      unmatched.push(detail);
      continue;
    }
    fields[field] = detail;
  }

  const matched = Object.keys(fields).length > 0;
  if (unmatched.length > 0) {
    return { fields, formMessage: unmatched.join(' ') };
  }
  if (!matched) {
    return { fields, formMessage: apiError.message };
  }
  return { fields, formMessage: null };
}

/** Writes mapped field messages onto a form. The caller decides which fields that form owns. */
export function applyMappedErrors<T extends FieldValues>(
  setError: UseFormSetError<T>,
  fields: Partial<Record<string, string>>,
  keys: readonly FieldPath<T>[],
): void {
  for (const key of keys) {
    const message = fields[key];
    if (message) {
      setError(key, { message });
    }
  }
}
