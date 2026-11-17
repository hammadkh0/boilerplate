import type { Metadata } from 'next';

import { AuthCard } from '@/components/auth/auth-card';
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';
import { AUTH_COPY } from '@/constants/copy/auth';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';

export const metadata: Metadata = {
  title: AUTH_COPY.FORGOT_TITLE,
  description: AUTH_COPY.FORGOT_DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard title={AUTH_COPY.FORGOT_TITLE} description={AUTH_COPY.FORGOT_CARD}>
      <ForgotPasswordForm />
    </AuthCard>
  );
}
