import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ChangePasswordForm } from '@/components/account/change-password-form';
import { ProfileForm } from '@/components/account/profile-form';
import { SignOutButton } from '@/components/account/sign-out-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ACCOUNT_COPY } from '@/constants/copy/account';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';
import { formatDate } from '@/lib/date';
import { getMeServer } from '@/services/users.server';
import AccountLoading from '../loading';

export const metadata: Metadata = {
  title: ACCOUNT_COPY.TITLE,
  description: ACCOUNT_COPY.DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountLoading />}>
      <AccountContent />
    </Suspense>
  );
}

async function AccountContent() {
  const user = await getMeServer();
  const verifiedOn = formatDate(user.emailVerifiedAt);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">{ACCOUNT_COPY.TITLE}</h1>
          <p className="text-muted-foreground">{ACCOUNT_COPY.INTRO}</p>
        </div>
        <SignOutButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{ACCOUNT_COPY.PROFILE_TITLE}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm">
            {ACCOUNT_COPY.EMAIL}: {user.email}
          </p>
          <p className="text-muted-foreground text-sm">
            {verifiedOn ? ACCOUNT_COPY.VERIFIED(verifiedOn) : ACCOUNT_COPY.NOT_VERIFIED}
          </p>
          <ProfileForm key={user.fullName} user={user} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{ACCOUNT_COPY.PASSWORD_TITLE}</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>
    </div>
  );
}
