import 'server-only';

import { serverFetch } from '@/services/http/server';
import type { DashboardKpis } from '@/types';

export function getDashboardServer(): Promise<DashboardKpis> {
  return serverFetch<DashboardKpis>('/dashboard', { cache: 'no-store' });
}
