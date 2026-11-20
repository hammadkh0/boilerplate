'use client';

import { LoadingButton } from '@/components/forms/loading-button';
import { ACCOUNT_COPY } from '@/constants/copy/account';
import { useSignOut } from '@/hooks/use-sign-out';

export function SignOutButton() {
  const signOut = useSignOut();

  return (
    <LoadingButton
      type="button"
      variant="outline"
      className="h-10"
      loading={signOut.isPending}
      onClick={() => signOut.mutate()}
    >
      {ACCOUNT_COPY.SIGN_OUT}
    </LoadingButton>
  );
}
