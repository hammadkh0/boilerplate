'use client';

import { Eye, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

import { DataTable } from '@/components/data-table/data-table';
import { DataTablePagination } from '@/components/data-table/data-table-pagination';
import { DateFilter } from '@/components/data-table/date-filter';
import { DebouncedSearch } from '@/components/data-table/debounced-search';
import { FilterSelect } from '@/components/data-table/filter-select';
import { SortableHead } from '@/components/data-table/sortable-head';
import { TableRefreshButton } from '@/components/data-table/table-refresh-button';
import { TableToolbar } from '@/components/data-table/table-toolbar';
import {
  StatusBadge,
  UserDeleteDialog,
  UserDetailsDialog,
  UserStatusDialog,
  roleLabel,
} from '@/components/users/user-dialogs';
import { toUsersListQuery } from '@/components/users/list-query';
import { usersSearchParams } from '@/components/users/search-params';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { SORT_ORDER, USER_ROLE, USER_SORT_FIELDS, USER_STATUS } from '@/constants';
import { useTableRefresh } from '@/hooks/use-table-refresh';
import { useTableUrlState } from '@/hooks/use-table-url-state';
import { formatDate } from '@/lib/date';
import { toApiError } from '@/lib/http';
import { usersListQueryOptions } from '@/queries/users';
import type { AdminUserListItem, Paginated, UserRole, UserStatus } from '@/types';

const roleOptions = [
  { value: USER_ROLE.USER, label: ADMIN_COPY.ROLE_USER },
  { value: USER_ROLE.SUPER_ADMIN, label: ADMIN_COPY.ROLE_ADMIN },
] as const;

const statusOptions = [
  { value: USER_STATUS.ACTIVE, label: ADMIN_COPY.STATUS_ACTIVE },
  { value: USER_STATUS.SUSPENDED, label: ADMIN_COPY.STATUS_SUSPENDED },
] as const;

const verifiedOptions = [
  { value: 'true', label: ADMIN_COPY.YES },
  { value: 'false', label: ADMIN_COPY.NO },
] as const;

export function UsersTable({
  initialData,
  currentUserId,
}: {
  initialData: Paginated<AdminUserListItem>;
  currentUserId: string;
}) {
  const { state, setQuery } = useTableUrlState(usersSearchParams);
  const queryInput = toUsersListQuery(state);
  const [firstQuery] = useState(queryInput);
  const query = useQuery({
    ...usersListQueryOptions(
      queryInput,
      JSON.stringify(queryInput) === JSON.stringify(firstQuery) ? initialData : undefined,
    ),
  });
  const refresh = useTableRefresh(() => query.refetch());
  const [detailsId, setDetailsId] = useState<string | null>(null);
  const [statusUser, setStatusUser] = useState<AdminUserListItem | null>(null);
  const [deleteUserRow, setDeleteUserRow] = useState<AdminUserListItem | null>(null);

  function cycleSort(field: string) {
    if (state.sortBy !== field) {
      void setQuery({ sortBy: field, sortOrder: SORT_ORDER.ASC });
      return;
    }
    if (state.sortOrder === SORT_ORDER.ASC) {
      void setQuery({ sortOrder: SORT_ORDER.DESC });
      return;
    }
    void setQuery({ sortBy: '', sortOrder: SORT_ORDER.DESC });
  }

  const rows = query.data?.items ?? [];
  const total = query.data?.meta.total ?? 0;

  return (
    <>
      <DataTable isDimmed={query.isFetching && !query.isLoading}>
        <TableToolbar
          refresh={
            <TableRefreshButton onRefresh={refresh.triggerRefresh} pending={refresh.isRefreshing} />
          }
        >
          <DebouncedSearch value={state.search} onChange={(search) => void setQuery({ search })} />
          <FilterSelect
            label={ADMIN_COPY.ROLE}
            value={state.role}
            options={roleOptions}
            onChange={(role) => void setQuery({ role: role as UserRole | null })}
          />
          <FilterSelect
            label={ADMIN_COPY.STATUS}
            value={state.status}
            options={statusOptions}
            onChange={(status) => void setQuery({ status: status as UserStatus | null })}
          />
          <FilterSelect
            label={ADMIN_COPY.VERIFIED}
            value={state.emailVerified}
            options={verifiedOptions}
            onChange={(emailVerified) =>
              void setQuery({ emailVerified: emailVerified as 'true' | 'false' | null })
            }
          />
          <DateFilter
            label={ADMIN_COPY.CREATED_FROM}
            value={state.createdFrom}
            onChange={(createdFrom) => void setQuery({ createdFrom })}
          />
          <DateFilter
            label={ADMIN_COPY.CREATED_TO}
            value={state.createdTo}
            onChange={(createdTo) => void setQuery({ createdTo })}
          />
        </TableToolbar>
        <Table>
          <TableHeader>
            <TableRow className="bg-table-header text-table-header-foreground hover:bg-table-header [&_button]:text-table-header-foreground [&_th]:text-table-header-foreground">
              <SortableHead
                label={ADMIN_COPY.NAME}
                field={USER_SORT_FIELDS.FULL_NAME}
                sortBy={state.sortBy}
                sortOrder={state.sortOrder}
                onSort={cycleSort}
              />
              <SortableHead
                label={ADMIN_COPY.EMAIL}
                field={USER_SORT_FIELDS.EMAIL}
                sortBy={state.sortBy}
                sortOrder={state.sortOrder}
                onSort={cycleSort}
                className="hidden md:table-cell"
              />
              <SortableHead
                label={ADMIN_COPY.ROLE}
                field={USER_SORT_FIELDS.ROLE}
                sortBy={state.sortBy}
                sortOrder={state.sortOrder}
                onSort={cycleSort}
                className="hidden lg:table-cell"
              />
              <SortableHead
                label={ADMIN_COPY.STATUS}
                field={USER_SORT_FIELDS.STATUS}
                sortBy={state.sortBy}
                sortOrder={state.sortOrder}
                onSort={cycleSort}
              />
              <TableHead className="hidden md:table-cell">{ADMIN_COPY.VERIFIED}</TableHead>
              <SortableHead
                label={ADMIN_COPY.JOINED}
                field={USER_SORT_FIELDS.CREATED_AT}
                sortBy={state.sortBy}
                sortOrder={state.sortOrder}
                onSort={cycleSort}
                className="hidden lg:table-cell"
              />
              <TableHead>{ADMIN_COPY.ACTIONS}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isLoading
              ? Array.from({ length: state.limit }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={7}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : null}
            {query.isError ? (
              <TableRow>
                <TableCell colSpan={7} className="text-destructive">
                  {toApiError(query.error).message || ADMIN_COPY.LOAD_ERROR}
                </TableCell>
              </TableRow>
            ) : null}
            {!query.isLoading && !query.isError && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7}>
                  <Empty className="border-0">
                    <EmptyHeader>
                      <EmptyTitle>{ADMIN_COPY.EMPTY}</EmptyTitle>
                      <EmptyDescription>{ADMIN_COPY.USERS_INTRO}</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : null}
            {rows.map((user) => (
              <TableRow key={user.id} className="even:bg-muted/40">
                <TableCell>{user.fullName}</TableCell>
                <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                <TableCell className="hidden lg:table-cell">{roleLabel(user.role)}</TableCell>
                <TableCell>
                  <StatusBadge status={user.status} />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.emailVerifiedAt ? ADMIN_COPY.YES : ADMIN_COPY.NO}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{formatDate(user.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <IconAction label={ADMIN_COPY.DETAILS} onClick={() => setDetailsId(user.id)}>
                      <Eye aria-hidden />
                    </IconAction>
                    {user.id === currentUserId ? null : (
                      <>
                        <IconAction
                          label={
                            user.status === USER_STATUS.SUSPENDED
                              ? ADMIN_COPY.ACTIVATE
                              : ADMIN_COPY.SUSPEND
                          }
                          onClick={() => setStatusUser(user)}
                        >
                          {user.status === USER_STATUS.SUSPENDED ? (
                            <ShieldCheck aria-hidden />
                          ) : (
                            <ShieldOff aria-hidden />
                          )}
                        </IconAction>
                        <IconAction
                          label={ADMIN_COPY.DELETE}
                          onClick={() => setDeleteUserRow(user)}
                        >
                          <Trash2 aria-hidden />
                        </IconAction>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <DataTablePagination
          page={state.page}
          pageSize={state.limit}
          total={total}
          onPageChange={(page) => void setQuery({ page })}
          onPageSizeChange={(limit) => void setQuery({ limit })}
        />
      </DataTable>
      <UserDetailsDialog userId={detailsId} onClose={() => setDetailsId(null)} />
      <UserStatusDialog user={statusUser} onClose={() => setStatusUser(null)} />
      <UserDeleteDialog user={deleteUserRow} onClose={() => setDeleteUserRow(null)} />
    </>
  );
}

function IconAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-10"
          aria-label={label}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}
