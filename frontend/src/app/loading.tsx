import { Skeleton } from '@/components/ui/skeleton';
import { APP_COPY } from '@/constants/copy/app';

export default function Loading() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-4 px-6 py-24">
      <span className="sr-only">{APP_COPY.LOADING}</span>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-6 w-full max-w-xl" />
    </main>
  );
}
