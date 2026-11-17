import { api } from '@/services/http/client';
import { unwrapEnvelope } from '@/lib/http';
import type { ServiceRequestOptions, UserProfile } from '@/types';

export type AuthMessage = { message: string };

export type RegisterInput = {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

async function post<T>(path: string, body: unknown, options?: ServiceRequestOptions): Promise<T> {
  const response = await api.post(path, body, { signal: options?.signal });
  return unwrapEnvelope<T>(response.data);
}

export function register(
  input: RegisterInput,
  options?: ServiceRequestOptions,
): Promise<AuthMessage> {
  return post('/auth/register', input, options);
}

export function login(input: LoginInput, options?: ServiceRequestOptions): Promise<UserProfile> {
  return post('/auth/login', input, options);
}

export function logout(options?: ServiceRequestOptions): Promise<AuthMessage> {
  return post('/auth/logout', {}, options);
}

export function forgotPassword(
  email: string,
  options?: ServiceRequestOptions,
): Promise<AuthMessage> {
  return post('/auth/forgot-password', { email }, options);
}

export function resetPassword(
  input: { token: string; password: string; confirmPassword: string },
  options?: ServiceRequestOptions,
): Promise<AuthMessage> {
  return post('/auth/reset-password', input, options);
}

export function verifyEmail(token: string, options?: ServiceRequestOptions): Promise<AuthMessage> {
  return post('/auth/verify-email', { token }, options);
}

export function resendVerification(
  email: string,
  options?: ServiceRequestOptions,
): Promise<AuthMessage> {
  return post('/auth/resend-verification', { email }, options);
}

export function changePassword(
  input: { currentPassword: string; newPassword: string; confirmPassword: string },
  options?: ServiceRequestOptions,
): Promise<UserProfile> {
  return post('/auth/change-password', input, options);
}
