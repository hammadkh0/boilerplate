import type { Metadata } from 'next';
import { Suspense } from 'react';

import { AuthCard } from '@/components/auth/auth-card';
import { LoginForm } from '@/components/auth/login-form';
import { AUTH_COPY } from '@/constants/copy/auth';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';
import { readSearchParam, sanitizeRedirectPath } from '@/lib/utils';
import AuthLoading from '../loading';

export const metadata: Metadata = {
  title: AUTH_COPY.LOGIN_TITLE,
  description: AUTH_COPY.LOGIN_DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const nextPath = sanitizeRedirectPath(readSearchParam(params.next));

  return (
    <AuthCard title={AUTH_COPY.LOGIN_TITLE} description={AUTH_COPY.LOGIN_CARD}>
      <LoginForm nextPath={nextPath} />
    </AuthCard>
  );
}
