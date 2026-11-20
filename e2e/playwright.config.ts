import { defineConfig, devices } from '@playwright/test';

import { BACKEND_ENV, BACKEND_URL, E2E_PORTS, FRONTEND_URL } from './support/env';

process.env.NEXT_PUBLIC_SITE_URL ??= FRONTEND_URL;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  globalSetup: './global-setup.ts',
  use: {
    baseURL: FRONTEND_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'npx prisma migrate reset --force && npm run seed && npm run build && npm run start',
      cwd: '../backend',
      url: `${BACKEND_URL}/health`,
      env: {
        ...BACKEND_ENV,
        // Prisma blocks migrate reset from an agent unless this carries the user's consent.
        ...(process.env.PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION
          ? {
              PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION:
                process.env.PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION,
            }
          : {}),
      },
      timeout: 180_000,
      reuseExistingServer: process.env.E2E_REUSE_SERVERS === 'true',
    },
    {
      command: `npm run build && npm run start -- -p ${E2E_PORTS.FRONTEND}`,
      cwd: '../frontend',
      url: FRONTEND_URL,
      env: { BACKEND_URL, NEXT_PUBLIC_SITE_URL: FRONTEND_URL },
      timeout: 240_000,
      reuseExistingServer: process.env.E2E_REUSE_SERVERS === 'true',
    },
  ],
});
