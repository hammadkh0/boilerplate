import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ChangePasswordForm } from '@/components/account/change-password-form';
import { ProfileForm } from '@/components/account/profile-form';
import { PageHeader } from '@/components/admin/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ACCOUNT_COPY } from '@/constants/copy/account';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { PRIVATE_PAGE_ROBOTS } from '@/constants';
import { formatDate } from '@/lib/date';
import { getMeServer } from '@/services/users.server';

export const metadata: Metadata = {
  title: ADMIN_COPY.PROFILE_TITLE,
  description: ADMIN_COPY.PROFILE_DESCRIPTION,
  robots: PRIVATE_PAGE_ROBOTS,
};

export default function AdminProfilePage() {
  return (
    <Suspense>
      <ProfileContent />
    </Suspense>
  );
}

async function ProfileContent() {
  const user = await getMeServer();
  const verifiedOn = formatDate(user.emailVerifiedAt);

  return (
    <>
      <PageHeader title={ADMIN_COPY.PROFILE_TITLE} description={ADMIN_COPY.PROFILE_INTRO} />
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
    </>
  );
}
