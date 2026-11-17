'use client';

import { LoadingButton } from '@/components/forms/loading-button';
import { ADMIN_COPY } from '@/constants/copy/admin';

export function DataTableLoadMore({
  hasMore,
  pending,
  onLoadMore,
}: {
  hasMore: boolean;
  pending: boolean;
  onLoadMore: () => void;
}) {
  if (!hasMore) {
    return <p className="text-muted-foreground px-4 py-3 text-sm">{ADMIN_COPY.NO_MORE}</p>;
  }

  return (
    <div className="px-4 py-3">
      <LoadingButton type="button" className="h-10" loading={pending} onClick={onLoadMore}>
        {ADMIN_COPY.LOAD_MORE}
      </LoadingButton>
    </div>
  );
}
