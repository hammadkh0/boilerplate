import Link from 'next/link';

import { MobileNav } from '@/components/marketing/mobile-nav';
import { ThemeToggle } from '@/components/marketing/theme-toggle';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site.config';
import { MARKETING_COPY } from '@/constants/copy/marketing';
import { ROUTES } from '@/constants';

export function SiteHeader({ account = false }: { account?: boolean }) {
  return (
    <header className="bg-background/95 sticky top-0 z-30 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        <Link href={ROUTES.HOME} className="truncate text-sm font-semibold">
          {siteConfig.name}
        </Link>
        <div className="ml-auto flex items-center gap-1">
          <nav className="hidden items-center gap-1 md:flex">
            {account ? (
              <Button variant="ghost" asChild className="h-10">
                <Link href={ROUTES.ACCOUNT}>{MARKETING_COPY.NAV_ACCOUNT}</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="h-10">
                  <Link href={ROUTES.LOGIN}>{MARKETING_COPY.NAV_LOGIN}</Link>
                </Button>
                <Button variant="outline" asChild className="h-10">
                  <Link href={ROUTES.REGISTER}>{MARKETING_COPY.NAV_REGISTER}</Link>
                </Button>
              </>
            )}
          </nav>
          <ThemeToggle />
          <MobileNav account={account} />
        </div>
      </div>
    </header>
  );
}
