'use client';

import { LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@/components/forms/loading-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ACCOUNT_COPY } from '@/constants/copy/account';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { ROUTES } from '@/constants';
import { mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { USERS_QUERY_KEYS } from '@/queries/users';
import { logout } from '@/services/auth.service';
import type { UserProfile } from '@/types';

function initial(name: string): string {
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : '?';
}

export function AdminUserMenu({ user, compact = false }: { user: UserProfile; compact?: boolean }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: USERS_QUERY_KEYS.all });
      toast.success(ACCOUNT_COPY.SIGN_OUT_SUCCESS);
      router.push(ROUTES.HOME);
      router.refresh();
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      if (mapped.formMessage) {
        toast.error(mapped.formMessage);
      }
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg"
            aria-label={ADMIN_COPY.OPEN_MENU}
          >
            <Avatar>
              <AvatarFallback>{initial(user.fullName)}</AvatarFallback>
            </Avatar>
          </button>
        ) : (
          <button
            type="button"
            className="hover:bg-sidebar-accent flex w-full items-center gap-2 rounded-lg p-2 text-left"
            aria-label={ADMIN_COPY.OPEN_MENU}
          >
            <Avatar>
              <AvatarFallback>{initial(user.fullName)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="block truncate text-sm font-medium">{user.fullName}</span>
              <span className="text-muted-foreground block truncate text-xs">
                {ADMIN_COPY.SIGNED_IN}
              </span>
            </span>
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={ROUTES.ADMIN_PROFILE}>
            <UserRound aria-hidden />
            {ADMIN_COPY.NAV_PROFILE}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={mutation.isPending}
          onSelect={(event) => {
            event.preventDefault();
            mutation.mutate();
          }}
        >
          <LogOut aria-hidden />
          {ADMIN_COPY.LOG_OUT}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AdminSignOutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: USERS_QUERY_KEYS.all });
      toast.success(ACCOUNT_COPY.SIGN_OUT_SUCCESS);
      router.push(ROUTES.HOME);
      router.refresh();
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      if (mapped.formMessage) {
        toast.error(mapped.formMessage);
      }
    },
  });

  return (
    <LoadingButton
      type="button"
      variant="outline"
      className="h-10"
      loading={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {ADMIN_COPY.LOG_OUT}
    </LoadingButton>
  );
}
