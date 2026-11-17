'use client';

import { RouteError } from '@/components/route-error';

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col">
      <RouteError reset={reset} />
    </main>
  );
}
