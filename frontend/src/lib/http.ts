import axios, { type AxiosError } from 'axios';

import type { ApiFailure, ApiSuccess } from '@/types';

export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: string[];

  constructor(statusCode: number, message: string, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function isAbortError(error: unknown): boolean {
  return (
    axios.isCancel(error) ||
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && 'code' in error && error.code === 'ERR_CANCELED')
  );
}

/** Rethrows a cancelled request so React Query treats it as a cancellation. */
export function rethrowIfAbort(error: unknown): void {
  if (isAbortError(error)) {
    throw error;
  }
}

function isSuccess<T>(value: unknown): value is ApiSuccess<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === true &&
    'data' in value
  );
}

function isFailure(value: unknown): value is ApiFailure {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    value.success === false &&
    'error' in value
  );
}

/** Reads the `{ success, data }` envelope and returns `data`. */
export function unwrapEnvelope<T>(value: unknown): T {
  if (isSuccess<T>(value)) {
    return value.data;
  }
  if (isFailure(value)) {
    throw new ApiError(value.error.statusCode, value.error.message, value.error.details);
  }
  throw new ApiError(500, 'The server returned an unexpected response');
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (isFailure(axiosError.response?.data)) {
      const body = axiosError.response.data;
      return new ApiError(body.error.statusCode, body.error.message, body.error.details);
    }
    return new ApiError(axiosError.response?.status ?? 500, 'Request failed');
  }
  return new ApiError(500, 'Request failed');
}
