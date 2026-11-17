import { redirect } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';

import { AdminShell } from '@/components/admin/admin-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_PORTAL_ROLES, ROUTES } from '@/constants';
import { APP_COPY } from '@/constants/copy/app';
import { getCurrentUserServer } from '@/services/users.server';
import type { UserRole } from '@/types';

const adminRoles: readonly UserRole[] = ADMIN_PORTAL_ROLES;

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <AdminGate>{children}</AdminGate>
    </Suspense>
  );
}

async function AdminGate({ children }: { children: ReactNode }) {
  const user = await getCurrentUserServer();
  if (!adminRoles.includes(user.role)) {
    redirect(ROUTES.ACCOUNT);
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}

function AdminFallback() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-6">
      <span className="sr-only">{APP_COPY.LOADING}</span>
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}
