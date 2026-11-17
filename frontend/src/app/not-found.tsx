import type { Metadata } from 'next';
import Link from 'next/link';

import { SiteFooter } from '@/components/marketing/site-footer';
import { SiteHeader } from '@/components/marketing/site-header';
import { Button } from '@/components/ui/button';
import { APP_COPY } from '@/constants/copy/app';
import { ROUTES } from '@/constants';

export const metadata: Metadata = {
  title: APP_COPY.NOT_FOUND_TITLE,
  description: APP_COPY.NOT_FOUND_DESCRIPTION,
};

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold">{APP_COPY.NOT_FOUND_TITLE}</h1>
        <p className="text-muted-foreground">{APP_COPY.NOT_FOUND_BODY}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-10">
            <Link href={ROUTES.HOME}>{APP_COPY.NOT_FOUND_HOME}</Link>
          </Button>
          <Button variant="outline" asChild className="h-10">
            <Link href={ROUTES.LOGIN}>{APP_COPY.NOT_FOUND_LOGIN}</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
