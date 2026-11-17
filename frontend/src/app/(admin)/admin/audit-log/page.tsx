import type { Metadata } from 'next';
import { createSearchParamsCache } from 'nuqs/server';
import { Suspense } from 'react';

import { toAuditListQuery } from '@/components/audit-log/list-query';
import { AuditLogTable } from '@/components/audit-log/audit-log-table';
import { PageHeader } from '@/components/admin/page-header';
import { auditSearchParams } from '@/components/users/search-params';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';
import { listAuditLogsServer } from '@/services/audit-log.server';

const auditCache = createSearchParamsCache(auditSearchParams);

export const metadata: Metadata = {
  title: ADMIN_COPY.AUDIT_TITLE,
  description: ADMIN_COPY.AUDIT_DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense>
      <AuditContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AuditContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const state = auditCache.parse(await searchParams);
  const page = await listAuditLogsServer(toAuditListQuery(state));

  return (
    <>
      <PageHeader title={ADMIN_COPY.AUDIT_TITLE} description={ADMIN_COPY.AUDIT_INTRO} />
      <AuditLogTable initialData={page} />
    </>
  );
}
