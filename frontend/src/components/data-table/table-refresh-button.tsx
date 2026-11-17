'use client';

import { RefreshCw } from 'lucide-react';

import { LoadingButton } from '@/components/forms/loading-button';
import { ADMIN_COPY } from '@/constants/copy/admin';

export function TableRefreshButton({
  onRefresh,
  pending,
}: {
  onRefresh: () => void;
  pending: boolean;
}) {
  return (
    <LoadingButton type="button" className="h-10" loading={pending} onClick={onRefresh}>
      <RefreshCw aria-hidden />
      {ADMIN_COPY.REFRESH}
    </LoadingButton>
  );
}
