import { PASSWORD_REGEX } from '../../shared/constants';

export const AUTH_THROTTLE = {
  default: { limit: 30, ttl: 60_000 },
} as const;

export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const RESET_TTL_MS = 30 * 60 * 1000;
export const EMAIL_COOLDOWN_MS = 60_000;

export const AUTH_PASSWORD_PATTERN = PASSWORD_REGEX;

export const AUTH_MESSAGES = {
  REGISTERED: 'Account created. Check your inbox for a verification link.',
  INVALID_CREDENTIALS: 'Invalid email or password',
  LOGGED_OUT: 'Logged out',
  FORGOT_PASSWORD: 'If an account exists for that email, a reset link is on its way.',
  RESEND_VERIFICATION:
    'If an account exists and still needs verification, a new link is on its way.',
  EMAIL_VERIFIED: 'Email verified',
  PASSWORD_RESET: 'Password updated. You can log in with the new password.',
  PASSWORD_CHANGED: 'Password updated',
  INVALID_VERIFICATION: 'This verification link is invalid or has expired.',
  INVALID_RESET: 'This reset link is invalid or has expired.',
  INVALID_REFRESH: 'Invalid refresh token',
  CURRENT_PASSWORD: 'Current password is incorrect',
} as const;
