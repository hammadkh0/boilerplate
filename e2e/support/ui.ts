import type { Page } from '@playwright/test';

import { AUTH_COPY } from '@/constants/copy/auth';
import { ROUTES } from '@/constants';

/**
 * Fills the login form and submits it.
 * The caller asserts the destination, because an admin and a user land on different pages.
 */
export async function signInThroughUi(page: Page, email: string, password: string): Promise<void> {
  await page.goto(ROUTES.LOGIN);
  await page.getByLabel(AUTH_COPY.EMAIL, { exact: true }).fill(email);
  await page.getByLabel(AUTH_COPY.PASSWORD, { exact: true }).fill(password);
  await page.getByRole('button', { name: AUTH_COPY.LOGIN_SUBMIT }).click();
}
