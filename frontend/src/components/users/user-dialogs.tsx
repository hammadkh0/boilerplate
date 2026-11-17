'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { LoadingButton } from '@/components/forms/loading-button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { USER_ROLE, USER_STATUS } from '@/constants';
import { formatDate } from '@/lib/date';
import { toApiError } from '@/lib/http';
import { AUDIT_LOG_QUERY_KEYS } from '@/queries/audit-log';
import { DASHBOARD_QUERY_KEYS } from '@/queries/dashboard';
import { USERS_QUERY_KEYS, userDetailQueryOptions } from '@/queries/users';
import { deleteUser, updateUserStatus } from '@/services/users.service';
import type { AdminUserListItem, UserRole, UserStatus } from '@/types';

export function roleLabel(role: UserRole): string {
  switch (role) {
    case USER_ROLE.USER:
      return ADMIN_COPY.ROLE_USER;
    case USER_ROLE.SUPER_ADMIN:
      return ADMIN_COPY.ROLE_ADMIN;
    default: {
      const exhaustive: never = role;
      return exhaustive;
    }
  }
}

export function statusLabel(status: UserStatus): string {
  switch (status) {
    case USER_STATUS.ACTIVE:
      return ADMIN_COPY.STATUS_ACTIVE;
    case USER_STATUS.SUSPENDED:
      return ADMIN_COPY.STATUS_SUSPENDED;
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

function invalidateAdminLists(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEYS.all });
  void queryClient.invalidateQueries({ queryKey: AUDIT_LOG_QUERY_KEYS.all });
  void queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEYS.all });
}

export function UserDetailsDialog({
  userId,
  onClose,
}: {
  userId: string | null;
  onClose: () => void;
}) {
  const query = useQuery({
    ...userDetailQueryOptions(userId ?? ''),
    enabled: userId !== null,
  });
  const user = query.data;

  return (
    <Dialog open={userId !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{ADMIN_COPY.DETAILS_TITLE}</DialogTitle>
          <DialogDescription>{user?.email ?? ADMIN_COPY.DETAILS}</DialogDescription>
        </DialogHeader>
        {query.isError ? (
          <p className="text-destructive text-sm">{toApiError(query.error).message}</p>
        ) : null}
        {user ? (
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">{ADMIN_COPY.NAME}</dt>
              <dd>{user.fullName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{ADMIN_COPY.EMAIL}</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{ADMIN_COPY.ROLE}</dt>
              <dd>{roleLabel(user.role)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{ADMIN_COPY.STATUS}</dt>
              <dd>{statusLabel(user.status)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{ADMIN_COPY.VERIFIED}</dt>
              <dd>{user.emailVerifiedAt ? ADMIN_COPY.YES : ADMIN_COPY.NO}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{ADMIN_COPY.JOINED}</dt>
              <dd>{formatDate(user.createdAt)}</dd>
            </div>
          </dl>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export function UserStatusDialog({
  user,
  onClose,
}: {
  user: AdminUserListItem | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);
  const nextStatus =
    user?.status === USER_STATUS.SUSPENDED ? USER_STATUS.ACTIVE : USER_STATUS.SUSPENDED;
  const suspending = nextStatus === USER_STATUS.SUSPENDED;

  async function confirm() {
    if (!user) {
      return;
    }
    setPending(true);
    try {
      await updateUserStatus(user.id, nextStatus);
      invalidateAdminLists(queryClient);
      toast.success(ADMIN_COPY.STATUS_SAVED);
      onClose();
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={user !== null} onOpenChange={(open) => !open && !pending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {suspending ? ADMIN_COPY.SUSPEND_TITLE : ADMIN_COPY.ACTIVATE_TITLE}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {suspending ? ADMIN_COPY.SUSPEND_BODY : ADMIN_COPY.ACTIVATE_BODY}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{ADMIN_COPY.CANCEL}</AlertDialogCancel>
          <LoadingButton type="button" loading={pending} onClick={() => void confirm()}>
            {suspending ? ADMIN_COPY.CONFIRM_SUSPEND : ADMIN_COPY.CONFIRM_ACTIVATE}
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function UserDeleteDialog({
  user,
  onClose,
}: {
  user: AdminUserListItem | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  async function confirm() {
    if (!user) {
      return;
    }
    setPending(true);
    try {
      await deleteUser(user.id);
      invalidateAdminLists(queryClient);
      toast.success(ADMIN_COPY.USER_DELETED);
      onClose();
    } catch (error) {
      toast.error(toApiError(error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <AlertDialog open={user !== null} onOpenChange={(open) => !open && !pending && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{ADMIN_COPY.DELETE_TITLE}</AlertDialogTitle>
          <AlertDialogDescription>{ADMIN_COPY.DELETE_BODY}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>{ADMIN_COPY.CANCEL}</AlertDialogCancel>
          <LoadingButton
            type="button"
            variant="destructive"
            loading={pending}
            onClick={() => void confirm()}
          >
            {ADMIN_COPY.CONFIRM_DELETE}
          </LoadingButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <Badge variant={status === USER_STATUS.SUSPENDED ? 'destructive' : 'default'}>
      {statusLabel(status)}
    </Badge>
  );
}
