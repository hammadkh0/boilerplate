import { api } from '@/services/http/client';
import { unwrapEnvelope } from '@/lib/http';
import type { DashboardKpis, ServiceRequestOptions } from '@/types';

export function getDashboard(options?: ServiceRequestOptions): Promise<DashboardKpis> {
  return api
    .get('/dashboard', { signal: options?.signal })
    .then((response) => unwrapEnvelope(response.data));
}
