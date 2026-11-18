import { request } from '@playwright/test';

import { clearInbox } from './support/mailpit';

export default async function globalSetup(): Promise<void> {
  const context = await request.newContext();
  await clearInbox(context);
  await context.dispose();
}
