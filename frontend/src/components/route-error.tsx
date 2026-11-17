'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { APP_COPY } from '@/constants/copy/app';
import { ROUTES } from '@/constants';

export function RouteError({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="text-3xl font-semibold">{APP_COPY.ERROR_TITLE}</h1>
      <p className="text-muted-foreground">{APP_COPY.ERROR_DESCRIPTION}</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" className="h-10" onClick={reset}>
          {APP_COPY.ERROR_RETRY}
        </Button>
        <Button variant="outline" asChild className="h-10">
          <Link href={ROUTES.HOME}>{APP_COPY.ERROR_HOME}</Link>
        </Button>
      </div>
    </div>
  );
}
