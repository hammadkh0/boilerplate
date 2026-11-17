'use client';

import { useSyncExternalStore } from 'react';

/** True after the window has scrolled past `threshold` pixels. */
export function useScrolled(threshold = 16): boolean {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('scroll', onChange, { passive: true });
      return () => window.removeEventListener('scroll', onChange);
    },
    () => window.scrollY > threshold,
    () => false,
  );
}
