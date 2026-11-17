'use client';

import { useEffect, useRef, useState } from 'react';

type Options = {
  minSpinMs?: number;
};

/**
 * Busy state for a manual table refresh.
 * Filter-driven refetches do not flip the button. Pass a function that resolves when the fetch finishes.
 */
export function useTableRefresh(
  onRefresh: () => void | Promise<unknown>,
  { minSpinMs = 600 }: Options = {},
) {
  const [isPending, setIsPending] = useState(false);
  const [isMinSpin, setIsMinSpin] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const onRefreshRef = useRef(onRefresh);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isRefreshing = isPending || isMinSpin;

  function triggerRefresh() {
    if (isRefreshing) {
      return;
    }
    setIsPending(true);
    setIsMinSpin(true);
    timeoutRef.current = window.setTimeout(() => {
      setIsMinSpin(false);
    }, minSpinMs);
    void Promise.resolve(onRefreshRef.current()).finally(() => {
      setIsPending(false);
    });
  }

  return { triggerRefresh, isRefreshing, disabled: isRefreshing };
}
