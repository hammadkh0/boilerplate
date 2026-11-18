import { expect, test } from '@playwright/test';

import { ADMIN_COPY } from '@/constants/copy/admin';
import { ROUTES } from '@/constants';
import { AUTH_MESSAGES } from '../../backend/src/modules/auth/constants';

import { registerUser } from '../support/api';
import { E2E_ADMIN, E2E_PASSWORD, FRONTEND_URL } from '../support/env';
import { signInThroughUi } from '../support/ui';
import { uniqueEmail } from '../support/users';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('a regular user cannot open the admin dashboard', async ({ page, request }) => {
  const email = uniqueEmail();
  await registerUser(request, email);
  await signInThroughUi(page, email, E2E_PASSWORD);
  await expect(page).toHaveURL(new RegExp(ROUTES.ACCOUNT));

  await page.goto(ROUTES.ADMIN_DASHBOARD);
  await expect(page).toHaveURL(new RegExp(ROUTES.ACCOUNT));
});

test('an admin suspends a user', async ({ page, request, browser }) => {
  const email = uniqueEmail();
  await registerUser(request, email);

  await signInThroughUi(page, E2E_ADMIN.EMAIL, E2E_ADMIN.PASSWORD);
  await expect(page).toHaveURL(new RegExp(ROUTES.ADMIN_DASHBOARD));

  await page.goto(`${ROUTES.ADMIN_USERS}?search=${encodeURIComponent(email)}`);
  const row = page.getByRole('row', { name: new RegExp(escapeRegExp(email)) });
  await row.getByRole('button', { name: ADMIN_COPY.SUSPEND }).click();
  await page
    .getByRole('alertdialog')
    .getByRole('button', { name: ADMIN_COPY.CONFIRM_SUSPEND })
    .click();

  await expect(page.getByText(ADMIN_COPY.STATUS_SAVED)).toBeVisible();
  await expect(row).toContainText(ADMIN_COPY.STATUS_SUSPENDED);

  const context = await browser.newContext({ baseURL: FRONTEND_URL });
  const signedOut = await context.newPage();
  await signInThroughUi(signedOut, email, E2E_PASSWORD);
  await expect(
    signedOut.getByRole('alert').getByText(AUTH_MESSAGES.INVALID_CREDENTIALS),
  ).toBeVisible();
  await context.close();
});
