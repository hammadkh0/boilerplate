'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import { Button } from '@/components/ui/button';
import { MARKETING_COPY } from '@/constants/copy/marketing';

function subscribeToNothing() {
  return () => {};
}

function clientMounted() {
  return true;
}

function serverMounted() {
  return false;
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // The client snapshot flips after hydration, so the icon can follow the theme without an effect.
  const mounted = useSyncExternalStore(subscribeToNothing, clientMounted, serverMounted);
  const dark = mounted && resolvedTheme === 'dark';

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-10"
      aria-label={dark ? MARKETING_COPY.THEME_TO_LIGHT : MARKETING_COPY.THEME_TO_DARK}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
    >
      {dark ? <Sun aria-hidden /> : <Moon aria-hidden />}
    </Button>
  );
}
