import { NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { SOFT_DELETE_MODELS } from '../../shared/prisma/extensions/soft-delete';
import { releasedIdentityData } from './released-identity';

export const SOFT_DELETE_MODEL = {
  USER: 'User',
} as const;

export type SoftDeleteModel = (typeof SOFT_DELETE_MODEL)[keyof typeof SOFT_DELETE_MODEL];

type SoftDeleteClient = Prisma.TransactionClient;

/**
 * Sets `deletedAt` on a soft-deletable row.
 * For a user it also clears session and token hashes, bumps `tokenVersion`, and frees the email.
 * Throws NotFoundException when the row is missing or already deleted.
 */
export async function softDelete(
  db: SoftDeleteClient,
  model: SoftDeleteModel,
  id: string,
): Promise<void> {
  if (!SOFT_DELETE_MODELS.has(model)) {
    throw new Error(`${model} is not a soft-deletable model`);
  }

  if (model === SOFT_DELETE_MODEL.USER) {
    const user = await db.user.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, email: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        deletedAt: new Date(),
        tokenVersion: { increment: 1 },
        ...releasedIdentityData(user.id, user.email),
      },
    });
  }
}
