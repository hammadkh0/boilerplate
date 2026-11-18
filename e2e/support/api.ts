import { expect, type APIRequestContext } from '@playwright/test';

import { API_PREFIX } from '@/constants';

import { E2E_PASSWORD, FRONTEND_URL } from './env';

/**
 * Creates an account through the frontend origin, so the Next rewrite and Origin check run.
 * Throws when the API does not return 201.
 */
export async function registerUser(
  request: APIRequestContext,
  email: string,
  password = E2E_PASSWORD,
): Promise<void> {
  const response = await request.post(`${FRONTEND_URL}${API_PREFIX}/auth/register`, {
    headers: { Origin: FRONTEND_URL },
    data: { email, fullName: 'E2E User', password, confirmPassword: password },
  });
  expect(response.status()).toBe(201);
}
