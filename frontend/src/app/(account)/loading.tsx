import { Skeleton } from '@/components/ui/skeleton';
import { APP_COPY } from '@/constants/copy/app';

export default function AccountLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <span className="sr-only">{APP_COPY.LOADING}</span>
      <Skeleton className="h-10 w-40" />
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-56 w-full" />
    </div>
  );
}
