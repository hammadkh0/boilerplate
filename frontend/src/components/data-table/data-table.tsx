import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function DataTable({
  children,
  isDimmed = false,
}: {
  children: ReactNode;
  isDimmed?: boolean;
}) {
  return (
    <div
      className={cn(
        'bg-card overflow-hidden rounded-xl border',
        isDimmed && 'opacity-60 transition-opacity',
      )}
    >
      {children}
    </div>
  );
}
