import type { Prisma } from '@prisma/client';

export const AUTH_USER_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
  emailVerifiedAt: true,
} satisfies Prisma.UserSelect;

export type AuthUserProfile = Prisma.UserGetPayload<{ select: typeof AUTH_USER_SELECT }>;
