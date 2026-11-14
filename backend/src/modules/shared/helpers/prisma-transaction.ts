import { PRISMA_TRANSACTION } from '../constants';

export const PRISMA_TX_OPTIONS = {
  maxWait: PRISMA_TRANSACTION.MAX_WAIT_MS,
  timeout: PRISMA_TRANSACTION.TIMEOUT_MS,
} as const;
