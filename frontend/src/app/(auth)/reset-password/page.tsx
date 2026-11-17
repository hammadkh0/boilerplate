import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AuthCard } from '@/components/auth/auth-card';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { AUTH_COPY } from '@/constants/copy/auth';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';
import { readSearchParam } from '@/lib/utils';
import AuthLoading from '../loading';

export const metadata: Metadata = {
  title: AUTH_COPY.RESET_TITLE,
  description: AUTH_COPY.RESET_DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <ResetPasswordContent searchParams={searchParams} />
    </Suspense>
  );
}

async function ResetPasswordContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <AuthCard title={AUTH_COPY.RESET_TITLE} description={AUTH_COPY.RESET_CARD}>
      <ResetPasswordForm token={readSearchParam(params.token)} />
    </AuthCard>
  );
}
