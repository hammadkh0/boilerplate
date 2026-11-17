'use client';

import { Menu } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { MARKETING_COPY } from '@/constants/copy/marketing';
import { ROUTES } from '@/constants';
import { siteConfig } from '@/config/site.config';

const linkClass = 'flex min-h-10 items-center rounded-lg px-3 text-sm hover:bg-muted';

export function MobileNav({ account = false }: { account?: boolean }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10 md:hidden"
          aria-label={MARKETING_COPY.NAV_MENU}
        >
          <Menu aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>{siteConfig.name}</SheetTitle>
          <SheetDescription>{siteConfig.tagline}</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-2 px-4 pb-4">
          <SheetClose asChild>
            <Link href={ROUTES.HOME} className={linkClass}>
              {MARKETING_COPY.HOME_TITLE}
            </Link>
          </SheetClose>
          {account ? (
            <SheetClose asChild>
              <Link href={ROUTES.ACCOUNT} className={linkClass}>
                {MARKETING_COPY.NAV_ACCOUNT}
              </Link>
            </SheetClose>
          ) : (
            <>
              <SheetClose asChild>
                <Link href={ROUTES.LOGIN} className={linkClass}>
                  {MARKETING_COPY.NAV_LOGIN}
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <Button asChild className="h-10">
                  <Link href={ROUTES.REGISTER}>{MARKETING_COPY.NAV_REGISTER}</Link>
                </Button>
              </SheetClose>
            </>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
