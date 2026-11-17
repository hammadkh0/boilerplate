import 'server-only';

import { z } from 'zod';

import { publicEnv } from './env';

const serverEnvSchema = z.object({
  BACKEND_URL: z.url(),
});

/** Server-only env. Call this from server code, including the proxy. */
export function getServerEnv() {
  return {
    ...publicEnv,
    ...serverEnvSchema.parse({
      BACKEND_URL: process.env.BACKEND_URL,
    }),
  };
}
