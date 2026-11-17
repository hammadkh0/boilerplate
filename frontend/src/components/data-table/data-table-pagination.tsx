'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { PAGE_SIZE_OPTIONS } from '@/constants';
import { getPageNumbers, getPaginationRange, PAGE_ELLIPSIS } from '@/lib/pagination';

export function DataTablePagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) {
  const { from, to, totalPages } = getPaginationRange(page, pageSize, total);
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">{ADMIN_COPY.SHOWING(from, to, total)}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex items-center gap-2 text-sm">
          {ADMIN_COPY.ROWS_PER_PAGE}
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="h-10 w-20" aria-label={ADMIN_COPY.ROWS_PER_PAGE}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10"
            aria-label={ADMIN_COPY.FIRST_PAGE}
            disabled={page <= 1}
            onClick={() => onPageChange(1)}
          >
            <ChevronsLeft aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10"
            aria-label={ADMIN_COPY.PREVIOUS_PAGE}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft aria-hidden />
          </Button>
          {pages.map((item, index) =>
            item === PAGE_ELLIPSIS ? (
              <span key={`ellipsis-${index}`} className="px-1 text-sm">
                …
              </span>
            ) : (
              <Button
                key={item}
                type="button"
                variant={item === page ? 'default' : 'outline'}
                className="size-10"
                aria-label={ADMIN_COPY.PAGE(item)}
                aria-current={item === page ? 'page' : undefined}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            ),
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10"
            aria-label={ADMIN_COPY.NEXT_PAGE}
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight aria-hidden />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-10"
            aria-label={ADMIN_COPY.LAST_PAGE}
            disabled={page >= totalPages}
            onClick={() => onPageChange(totalPages)}
          >
            <ChevronsRight aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}
