import { expect, test } from '@playwright/test';

import { ACCOUNT_COPY } from '@/constants/copy/account';
import { AUTH_COPY } from '@/constants/copy/auth';
import { ROUTES } from '@/constants';
import { AUTH_MESSAGES } from '../../backend/src/modules/auth/constants';

import { registerUser } from '../support/api';
import { E2E_NEW_PASSWORD, E2E_PASSWORD } from '../support/env';
import { emailLink } from '../support/mailpit';
import { signInThroughUi } from '../support/ui';
import { uniqueEmail } from '../support/users';

test('register, verify, and sign in', async ({ page, request }) => {
  const email = uniqueEmail();

  await page.goto(ROUTES.REGISTER);
  await page.getByLabel(AUTH_COPY.FULL_NAME).fill('E2E User');
  await page.getByLabel(AUTH_COPY.EMAIL, { exact: true }).fill(email);
  await page.getByLabel(AUTH_COPY.PASSWORD, { exact: true }).fill(E2E_PASSWORD);
  await page.getByLabel(AUTH_COPY.CONFIRM_PASSWORD).fill(E2E_PASSWORD);
  await page.getByRole('button', { name: AUTH_COPY.REGISTER_SUBMIT }).click();

  await expect(page).toHaveURL(new RegExp(ROUTES.THANK_YOU));

  const link = await emailLink(request, email, ROUTES.VERIFY_EMAIL);
  await page.goto(link);
  await page.getByRole('button', { name: AUTH_COPY.VERIFY_SUBMIT }).click();
  await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}$`));

  await signInThroughUi(page, email, E2E_PASSWORD);
  await expect(page).toHaveURL(new RegExp(ROUTES.ACCOUNT));
  await expect(page.getByRole('heading', { name: ACCOUNT_COPY.TITLE })).toBeVisible();
  await expect(page.getByText(ACCOUNT_COPY.NOT_VERIFIED)).toBeHidden();
});

test('wrong password stays on the login page', async ({ page, request }) => {
  const email = uniqueEmail();
  await registerUser(request, email);

  await signInThroughUi(page, email, 'WrongPass1');

  await expect(page.getByRole('alert').getByText(AUTH_MESSAGES.INVALID_CREDENTIALS)).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}$`));
});

test('forgot password and reset', async ({ page, request }) => {
  const email = uniqueEmail();
  await registerUser(request, email);

  await page.goto(ROUTES.FORGOT_PASSWORD);
  await page.getByLabel(AUTH_COPY.EMAIL, { exact: true }).fill(email);
  await page.getByRole('button', { name: AUTH_COPY.FORGOT_SUBMIT }).click();
  await expect(
    page.getByRole('paragraph').filter({ hasText: AUTH_COPY.FORGOT_SUCCESS }),
  ).toBeVisible();

  const link = await emailLink(request, email, ROUTES.RESET_PASSWORD);
  await page.goto(link);
  await page.getByLabel(AUTH_COPY.NEW_PASSWORD).fill(E2E_NEW_PASSWORD);
  await page.getByLabel(AUTH_COPY.CONFIRM_PASSWORD).fill(E2E_NEW_PASSWORD);
  await page.getByRole('button', { name: AUTH_COPY.RESET_SUBMIT }).click();
  await expect(page).toHaveURL(new RegExp(`${ROUTES.LOGIN}$`));

  await signInThroughUi(page, email, E2E_NEW_PASSWORD);
  await expect(page).toHaveURL(new RegExp(ROUTES.ACCOUNT));
});

test('sign out sends the visitor back through login', async ({ page, request }) => {
  const email = uniqueEmail();
  await registerUser(request, email);
  await signInThroughUi(page, email, E2E_PASSWORD);
  await expect(page).toHaveURL(new RegExp(ROUTES.ACCOUNT));

  await page.getByRole('button', { name: ACCOUNT_COPY.SIGN_OUT }).click();
  await expect(page).toHaveURL(new RegExp(`${ROUTES.HOME}$`));

  await page.goto(ROUTES.ACCOUNT);
  await expect(page).toHaveURL(new RegExp(ROUTES.LOGIN));
  await expect(page).toHaveURL(/next=/);
});
