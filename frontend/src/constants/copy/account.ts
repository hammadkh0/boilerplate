import { siteConfig } from '@/config/site.config';

export const ACCOUNT_COPY = {
  TITLE: 'Account',
  DESCRIPTION: `Review your ${siteConfig.name} profile, update the name on the account, and change your password. This page stays private and opens only after you sign in.`,
  INTRO: 'Update the name on your account, or choose a new password.',
  PROFILE_TITLE: 'Profile',
  PROFILE_SUBMIT: 'Save name',
  PROFILE_SUCCESS: 'Name saved',
  EMAIL: 'Email',
  VERIFIED: (date: string) => `Email verified on ${date}.`,
  NOT_VERIFIED: 'Email is not verified yet. You can still sign in.',
  PASSWORD_TITLE: 'Password',
  PASSWORD_SUBMIT: 'Update password',
  PASSWORD_SUCCESS: 'Password updated',
  SIGN_OUT: 'Sign out',
  SIGN_OUT_SUCCESS: 'Signed out',
} as const;
