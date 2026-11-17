'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';

import { TableHead } from '@/components/ui/table';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { SORT_ORDER } from '@/constants';

export function SortableHead({
  label,
  field,
  sortBy,
  sortOrder,
  onSort,
  className,
}: {
  label: string;
  field: string;
  sortBy: string;
  sortOrder: string;
  onSort: (field: string) => void;
  className?: string;
}) {
  const active = sortBy === field;
  const Icon = !active ? ArrowUpDown : sortOrder === SORT_ORDER.ASC ? ArrowUp : ArrowDown;

  return (
    <TableHead className={className}>
      <button
        type="button"
        className="inline-flex items-center gap-1 whitespace-nowrap"
        aria-label={ADMIN_COPY.SORT(label)}
        onClick={() => onSort(field)}
      >
        {label}
        <Icon aria-hidden className="size-3.5 shrink-0" />
      </button>
    </TableHead>
  );
}
