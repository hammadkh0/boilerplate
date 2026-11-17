import { Skeleton } from '@/components/ui/skeleton';
import { APP_COPY } from '@/constants/copy/app';

export default function MarketingLoading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-10">
      <span className="sr-only">{APP_COPY.LOADING}</span>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-12 w-full max-w-xl" />
      <Skeleton className="h-6 w-full max-w-lg" />
      <Skeleton className="h-10 w-40" />
    </div>
  );
}
