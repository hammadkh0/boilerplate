import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, Role, UserStatus } from '@prisma/client';
import { Pool } from 'pg';

import { envSchema } from '../src/modules/config/env.schema';
import { PASSWORD_REGEX } from '../src/modules/shared/constants';
import { hashData } from '../src/modules/shared/utils';

/**
 * Creates or updates the SUPER_ADMIN from SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, and SEED_ADMIN_NAME.
 * Re-running the script replaces the password and logs that account out of other sessions.
 */
async function main(): Promise<void> {
  const env = envSchema.parse(process.env);
  const email = env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.SEED_ADMIN_PASSWORD;
  const fullName = env.SEED_ADMIN_NAME?.trim();

  if (!email || !password || !fullName) {
    throw new Error('SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, and SEED_ADMIN_NAME are required');
  }
  if (!PASSWORD_REGEX.test(password)) {
    throw new Error(
      'SEED_ADMIN_PASSWORD must be 8 to 72 characters with upper, lower, and a number',
    );
  }

  const pool = new Pool({ connectionString: env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    const passwordHash = await hashData(password);
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        fullName,
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        deletedAt: null,
        refreshTokenHash: null,
        tokenVersion: { increment: 1 },
      },
      create: {
        email,
        passwordHash,
        fullName,
        role: Role.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
      },
      select: { id: true, email: true, role: true },
    });
    process.stdout.write(`Seeded ${user.role} ${user.id}\n`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'seed failed';
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
