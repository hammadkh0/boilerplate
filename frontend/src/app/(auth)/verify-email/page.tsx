import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AuthCard } from '@/components/auth/auth-card';
import { VerifyEmailForm } from '@/components/auth/verify-email-form';
import { AUTH_COPY } from '@/constants/copy/auth';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';
import { readSearchParam } from '@/lib/utils';
import AuthLoading from '../loading';

export const metadata: Metadata = {
  title: AUTH_COPY.VERIFY_TITLE,
  description: AUTH_COPY.VERIFY_DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <VerifyEmailContent searchParams={searchParams} />
    </Suspense>
  );
}

async function VerifyEmailContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;

  return (
    <AuthCard title={AUTH_COPY.VERIFY_TITLE} description={AUTH_COPY.VERIFY_CARD}>
      <VerifyEmailForm token={readSearchParam(params.token)} />
    </AuthCard>
  );
}
