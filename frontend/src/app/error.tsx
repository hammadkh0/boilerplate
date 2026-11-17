'use client';

import { Button } from '@/components/ui/button';
import { APP_COPY } from '@/constants/copy/app';
import { ROUTES } from '@/constants';
import Link from 'next/link';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <h1 className="text-3xl font-semibold">{APP_COPY.ERROR_TITLE}</h1>
      <p className="text-muted-foreground">{APP_COPY.ERROR_DESCRIPTION}</p>
      <div className="flex gap-3">
        <Button type="button" onClick={reset}>
          {APP_COPY.ERROR_RETRY}
        </Button>
        <Button variant="outline" asChild>
          <Link href={ROUTES.HOME}>{APP_COPY.ERROR_HOME}</Link>
        </Button>
      </div>
    </main>
  );
}
