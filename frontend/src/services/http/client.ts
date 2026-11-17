import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

import { API_PREFIX } from '@/constants';
import { ApiError, isAbortError, toApiError } from '@/lib/http';

const sharedConfig = {
  baseURL: API_PREFIX,
  timeout: 15_000,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
};

/** No refresh interceptor. Auth routes that must not retry use this client. */
export const bareApi: AxiosInstance = axios.create(sharedConfig);

/** Browser client. A 401 refreshes the session once, and other requests wait in a queue. */
export const api: AxiosInstance = axios.create(sharedConfig);

const AUTH_PATHS_SKIP_REFRESH = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/auth/resend-verification',
];

type RetryConfig = InternalAxiosRequestConfig & { alreadyRetried?: boolean };

type QueueItem = {
  resolve: () => void;
  reject: (reason: unknown) => void;
};

let refreshing = false;
let queue: QueueItem[] = [];

function requestPath(config: InternalAxiosRequestConfig): string {
  return config.url ?? '';
}

function shouldRefresh(config: InternalAxiosRequestConfig): boolean {
  const path = requestPath(config);
  return !AUTH_PATHS_SKIP_REFRESH.some((skip) => path.includes(skip));
}

function settleQueue(error: unknown): void {
  const pending = queue;
  queue = [];
  for (const item of pending) {
    if (error) {
      item.reject(error);
    } else {
      item.resolve();
    }
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (isAbortError(error) || !axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const original = error.config as RetryConfig | undefined;
    const canRefresh =
      error.response?.status === 401 &&
      original !== undefined &&
      original.alreadyRetried !== true &&
      shouldRefresh(original) &&
      typeof window !== 'undefined';

    if (!canRefresh || !original) {
      return Promise.reject(toApiError(error));
    }

    if (refreshing) {
      return new Promise<void>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then(() => api(original));
    }

    original.alreadyRetried = true;
    refreshing = true;

    try {
      await bareApi.post('/auth/refresh');
      settleQueue(undefined);
      return api(original);
    } catch (refreshError) {
      const apiError = toApiError(refreshError);
      settleQueue(apiError);
      return Promise.reject(apiError);
    } finally {
      refreshing = false;
    }
  },
);

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
