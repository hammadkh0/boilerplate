import type { ReactNode } from 'react';
import Link from 'next/link';

import { ThemeToggle } from '@/components/marketing/theme-toggle';
import { siteConfig } from '@/config/site.config';
import { ROUTES } from '@/constants';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="flex h-14 items-center justify-between px-4">
        <Link href={ROUTES.HOME} className="text-sm font-semibold">
          {siteConfig.name}
        </Link>
        <ThemeToggle />
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}
