import type { Metadata } from 'next';

import { AuthCard } from '@/components/auth/auth-card';
import { RegisterForm } from '@/components/auth/register-form';
import { AUTH_COPY } from '@/constants/copy/auth';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';

export const metadata: Metadata = {
  title: AUTH_COPY.REGISTER_TITLE,
  description: AUTH_COPY.REGISTER_DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function RegisterPage() {
  return (
    <AuthCard title={AUTH_COPY.REGISTER_TITLE} description={AUTH_COPY.REGISTER_CARD}>
      <RegisterForm />
    </AuthCard>
  );
}
