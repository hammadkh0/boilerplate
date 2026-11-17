'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTableLoadMore } from '@/components/data-table/data-table-load-more';
import { DateFilter } from '@/components/data-table/date-filter';
import { DebouncedSearch } from '@/components/data-table/debounced-search';
import { FilterSelect } from '@/components/data-table/filter-select';
import { TableRefreshButton } from '@/components/data-table/table-refresh-button';
import { TableToolbar } from '@/components/data-table/table-toolbar';
import { toAuditListQuery } from '@/components/audit-log/list-query';
import { auditSearchParams } from '@/components/users/search-params';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { AUDIT_ACTION, AUDIT_ENTITY } from '@/constants';
import { useTableRefresh } from '@/hooks/use-table-refresh';
import { useTableUrlState } from '@/hooks/use-table-url-state';
import { formatDateTime } from '@/lib/date';
import { toApiError } from '@/lib/http';
import { auditLogInfiniteQueryOptions } from '@/queries/audit-log';
import type { AuditLogItem, CursorPage } from '@/types';

const actionOptions = [
  { value: AUDIT_ACTION.USER_SUSPENDED, label: ADMIN_COPY.ACTION_SUSPENDED },
  { value: AUDIT_ACTION.USER_ACTIVATED, label: ADMIN_COPY.ACTION_ACTIVATED },
  { value: AUDIT_ACTION.USER_SOFT_DELETED, label: ADMIN_COPY.ACTION_DELETED },
] as const;

function actionLabel(action: string): string {
  switch (action) {
    case AUDIT_ACTION.USER_SUSPENDED:
      return ADMIN_COPY.ACTION_SUSPENDED;
    case AUDIT_ACTION.USER_ACTIVATED:
      return ADMIN_COPY.ACTION_ACTIVATED;
    case AUDIT_ACTION.USER_SOFT_DELETED:
      return ADMIN_COPY.ACTION_DELETED;
    default:
      return action;
  }
}

export function AuditLogTable({ initialData }: { initialData: CursorPage<AuditLogItem> }) {
  const { state, setQuery } = useTableUrlState(auditSearchParams);
  const queryInput = toAuditListQuery(state);
  const [firstQuery] = useState(() => JSON.stringify(queryInput));
  const query = useInfiniteQuery({
    ...auditLogInfiniteQueryOptions(queryInput),
    ...(JSON.stringify(queryInput) === firstQuery
      ? { initialData: { pages: [initialData], pageParams: [undefined] } }
      : {}),
  });
  const refresh = useTableRefresh(() => query.refetch());
  const rows = query.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <DataTable isDimmed={query.isFetching && !query.isLoading}>
      <TableToolbar
        refresh={
          <TableRefreshButton onRefresh={refresh.triggerRefresh} pending={refresh.isRefreshing} />
        }
      >
        <DebouncedSearch value={state.search} onChange={(search) => void setQuery({ search })} />
        <label className="flex min-w-48 flex-col gap-1 text-sm">
          {ADMIN_COPY.ACTOR}
          <Input
            value={state.actorId}
            maxLength={36}
            onChange={(event) => void setQuery({ actorId: event.target.value.trim() })}
            className="h-10"
          />
        </label>
        <FilterSelect
          label={ADMIN_COPY.ACTION}
          value={state.action}
          options={actionOptions}
          onChange={(action) =>
            void setQuery({
              action: action as (typeof AUDIT_ACTION)[keyof typeof AUDIT_ACTION] | null,
            })
          }
        />
        <label className="flex min-w-36 flex-col gap-1 text-sm">
          {ADMIN_COPY.ENTITY_TYPE}
          <Input
            value={state.entityType}
            maxLength={64}
            placeholder={AUDIT_ENTITY.USER}
            onChange={(event) => void setQuery({ entityType: event.target.value })}
            className="h-10"
          />
        </label>
        <DateFilter
          label={ADMIN_COPY.FROM}
          value={state.from}
          onChange={(from) => void setQuery({ from })}
        />
        <DateFilter
          label={ADMIN_COPY.TO}
          value={state.to}
          onChange={(to) => void setQuery({ to })}
        />
      </TableToolbar>
      <Table>
        <TableHeader>
          <TableRow className="bg-table-header text-table-header-foreground hover:bg-table-header [&_button]:text-table-header-foreground [&_th]:text-table-header-foreground">
            <TableHead>{ADMIN_COPY.WHEN}</TableHead>
            <TableHead>{ADMIN_COPY.ACTOR}</TableHead>
            <TableHead>{ADMIN_COPY.ACTION}</TableHead>
            <TableHead className="hidden md:table-cell">{ADMIN_COPY.ENTITY}</TableHead>
            <TableHead className="hidden lg:table-cell">{ADMIN_COPY.ENTITY_ID}</TableHead>
            <TableHead className="hidden lg:table-cell">{ADMIN_COPY.IP}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {query.isLoading
            ? Array.from({ length: state.limit }, (_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={6}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : null}
          {query.isError ? (
            <TableRow>
              <TableCell colSpan={6} className="text-destructive">
                {toApiError(query.error).message || ADMIN_COPY.LOAD_ERROR}
              </TableCell>
            </TableRow>
          ) : null}
          {!query.isLoading && !query.isError && rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6}>
                <Empty className="border-0">
                  <EmptyHeader>
                    <EmptyTitle>{ADMIN_COPY.EMPTY}</EmptyTitle>
                    <EmptyDescription>{ADMIN_COPY.AUDIT_INTRO}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
          ) : null}
          {rows.map((row) => (
            <TableRow key={row.id} className="even:bg-muted/40">
              <TableCell>{formatDateTime(row.createdAt)}</TableCell>
              <TableCell>{row.actor.fullName || ADMIN_COPY.UNKNOWN_ACTOR}</TableCell>
              <TableCell>{actionLabel(row.action)}</TableCell>
              <TableCell className="hidden md:table-cell">{row.entityType}</TableCell>
              <TableCell className="hidden lg:table-cell">{row.entityId}</TableCell>
              <TableCell className="hidden lg:table-cell">{row.ip ?? ''}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DataTableLoadMore
        hasMore={query.hasNextPage}
        pending={query.isFetchingNextPage}
        onLoadMore={() => void query.fetchNextPage()}
      />
    </DataTable>
  );
}
