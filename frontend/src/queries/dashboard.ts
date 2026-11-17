import { queryOptions } from '@tanstack/react-query';

import { withSignal } from '@/lib/react-query';
import { getDashboard } from '@/services/dashboard.service';
import type { DashboardKpis } from '@/types';

export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  kpis: ['dashboard', 'kpis'] as const,
};

export function dashboardQueryOptions(initialData?: DashboardKpis) {
  return queryOptions({
    queryKey: DASHBOARD_QUERY_KEYS.kpis,
    queryFn: withSignal(getDashboard),
    initialData,
  });
}
