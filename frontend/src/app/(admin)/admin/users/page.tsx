import type { Metadata } from 'next';
import { createSearchParamsCache } from 'nuqs/server';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin/page-header';
import { toUsersListQuery } from '@/components/users/list-query';
import { usersSearchParams } from '@/components/users/search-params';
import { UsersTable } from '@/components/users/users-table';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';
import { listUsersServer, getMeServer } from '@/services/users.server';

const usersCache = createSearchParamsCache(usersSearchParams);

export const metadata: Metadata = {
  title: ADMIN_COPY.USERS_TITLE,
  description: ADMIN_COPY.USERS_DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function UsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense>
      <UsersContent searchParams={searchParams} />
    </Suspense>
  );
}

async function UsersContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = usersCache.parse(await searchParams);
  const [users, me] = await Promise.all([listUsersServer(toUsersListQuery(state)), getMeServer()]);

  return (
    <>
      <PageHeader title={ADMIN_COPY.USERS_TITLE} description={ADMIN_COPY.USERS_INTRO} />
      <UsersTable initialData={users} currentUserId={me.id} />
    </>
  );
}
