import { Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

import { PrismaService } from '../shared/prisma/prisma.service';

export type DashboardKpis = {
  totalUsers: number;
  newUsersThisWeek: number;
  verifiedPercentage: number;
  suspendedCount: number;
};

/**
 * Four user counts for the admin dashboard.
 * Reads use count and groupBy so the rows themselves are not loaded.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(now = new Date()): Promise<DashboardKpis> {
    const weekStart = startOfUtcWeek(now);
    const [totalUsers, newUsersThisWeek, verifiedUsers, grouped] = await Promise.all([
      this.prisma.withSoftDelete.user.count(),
      this.prisma.withSoftDelete.user.count({ where: { createdAt: { gte: weekStart } } }),
      this.prisma.withSoftDelete.user.count({ where: { emailVerifiedAt: { not: null } } }),
      this.prisma.withSoftDelete.user.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const suspended = grouped.find((row) => row.status === UserStatus.SUSPENDED);
    return {
      totalUsers,
      newUsersThisWeek,
      verifiedPercentage:
        totalUsers === 0 ? 0 : Math.round((verifiedUsers / totalUsers) * 1000) / 10,
      suspendedCount: suspended?._count._all ?? 0,
    };
  }
}

function startOfUtcWeek(now: Date): Date {
  const midnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = midnight.getUTCDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  midnight.setUTCDate(midnight.getUTCDate() - daysSinceMonday);
  return midnight;
}
