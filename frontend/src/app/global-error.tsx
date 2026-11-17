'use client';

import { APP_COPY } from '@/constants/copy/app';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="mx-auto flex min-h-full max-w-3xl flex-col justify-center gap-4 px-6 py-24">
        <h1 className="text-3xl font-semibold">{APP_COPY.ERROR_TITLE}</h1>
        <p>{APP_COPY.ERROR_DESCRIPTION}</p>
        <button type="button" onClick={reset}>
          {APP_COPY.ERROR_RETRY}
        </button>
      </body>
    </html>
  );
}
