import type { Prisma } from '@prisma/client';

export const ADMIN_USER_LIST_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
  emailVerifiedAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type AdminUserListItem = Prisma.UserGetPayload<{ select: typeof ADMIN_USER_LIST_SELECT }>;

export const USER_PROFILE_SELECT = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  status: true,
  emailVerifiedAt: true,
  avatarKey: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type UserProfileRecord = Prisma.UserGetPayload<{ select: typeof USER_PROFILE_SELECT }>;

export type UserProfile = Omit<UserProfileRecord, 'avatarKey'> & {
  avatarUrl: string | null;
};
