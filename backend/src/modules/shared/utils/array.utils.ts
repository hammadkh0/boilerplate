/** Splits `items` into arrays of at most `size`. Throws when `size` is below 1. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size < 1) {
    throw new Error('chunk size must be at least 1');
  }

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

/**
 * Runs `fn` over `items` with at most `concurrency` calls in flight.
 * Results stay in input order. A rejection fails the whole call.
 */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) {
    return [];
  }

  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results: R[] = new Array<R>(items.length);
  let nextIndex = 0;

  const worker = async (): Promise<void> => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      const item = items[index];
      if (item === undefined) {
        return;
      }
      results[index] = await fn(item, index);
    }
  };

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}

/** Fisher-Yates shuffle. Mutates and returns `items`. */
export function shuffleInPlace<T>(items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = items[index];
    const swap = items[swapIndex];
    if (current === undefined || swap === undefined) {
      continue;
    }
    items[index] = swap;
    items[swapIndex] = current;
  }

  return items;
}
