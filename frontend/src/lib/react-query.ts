import type { ServiceRequestOptions } from '@/types';

/**
 * Forwards React Query's abort signal as the last argument of a service read.
 * The service function must accept `ServiceRequestOptions` last.
 */
export function withSignal<Args extends unknown[], Result>(
  fn: (...args: [...Args, ServiceRequestOptions?]) => Promise<Result>,
  ...args: Args
): (context: { signal: AbortSignal }) => Promise<Result> {
  return ({ signal }) => fn(...args, { signal });
}
