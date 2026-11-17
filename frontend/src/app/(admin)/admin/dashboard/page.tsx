import type { Metadata } from 'next';
import { Suspense } from 'react';

import { KpiCard } from '@/components/admin/kpi-card';
import { PageHeader } from '@/components/admin/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';
import { APP_COPY } from '@/constants/copy/app';
import { getDashboardServer } from '@/services/dashboard.server';

export const metadata: Metadata = {
  title: ADMIN_COPY.DASHBOARD_TITLE,
  description: ADMIN_COPY.DASHBOARD_DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const kpis = await getDashboardServer();

  return (
    <>
      <PageHeader title={ADMIN_COPY.DASHBOARD_TITLE} description={ADMIN_COPY.DASHBOARD_INTRO} />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={ADMIN_COPY.KPI_TOTAL}
          value={String(kpis.totalUsers)}
          accentClassName="border-l-primary"
        />
        <KpiCard
          label={ADMIN_COPY.KPI_NEW}
          value={String(kpis.newUsersThisWeek)}
          accentClassName="border-l-chart-3"
        />
        <KpiCard
          label={ADMIN_COPY.KPI_VERIFIED}
          value={`${kpis.verifiedPercentage}%`}
          accentClassName="border-l-chart-2"
        />
        <KpiCard
          label={ADMIN_COPY.KPI_SUSPENDED}
          value={String(kpis.suspendedCount)}
          accentClassName="border-l-destructive"
        />
      </section>
    </>
  );
}

function DashboardFallback() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <span className="sr-only">{APP_COPY.LOADING}</span>
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
      <Skeleton className="h-24" />
    </div>
  );
}
