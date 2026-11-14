/** Waits for `ms` milliseconds. Useful in retries and tests. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
