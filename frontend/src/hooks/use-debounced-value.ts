'use client';

import { useEffect, useState } from 'react';

import { SEARCH_DEBOUNCE_MS } from '@/constants';

/** Returns `value` after it has stayed unchanged for `delayMs`. The update happens in the timer, not the effect body. */
export function useDebouncedValue<T>(value: T, delayMs: number = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debounced;
}
