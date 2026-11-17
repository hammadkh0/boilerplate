import { Skeleton } from '@/components/ui/skeleton';
import { APP_COPY } from '@/constants/copy/app';

export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-4">
      <span className="sr-only">{APP_COPY.LOADING}</span>
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-4 w-72" />
      <Skeleton className="h-64 w-full" />
    </div>
  );
}
