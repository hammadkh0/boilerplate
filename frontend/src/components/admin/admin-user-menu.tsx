'use client';

import { LogOut, UserRound } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { ROUTES } from '@/constants';
import { useSignOut } from '@/hooks/use-sign-out';
import type { UserProfile } from '@/types';

function initial(name: string): string {
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : '?';
}

export function AdminUserMenu({ user, compact = false }: { user: UserProfile; compact?: boolean }) {
  const signOut = useSignOut();

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
          disabled={signOut.isPending}
          onSelect={(event) => {
            event.preventDefault();
            signOut.mutate();
          }}
        >
          <LogOut aria-hidden />
          {ADMIN_COPY.LOG_OUT}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
