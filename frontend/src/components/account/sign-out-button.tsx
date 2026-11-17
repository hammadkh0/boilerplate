'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LoadingButton } from '@/components/forms/loading-button';
import { ACCOUNT_COPY } from '@/constants/copy/account';
import { ROUTES } from '@/constants';
import { mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { USERS_QUERY_KEYS } from '@/queries/users';
import { logout } from '@/services/auth.service';

export function SignOutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: USERS_QUERY_KEYS.all });
      toast.success(ACCOUNT_COPY.SIGN_OUT_SUCCESS);
      router.push(ROUTES.HOME);
      router.refresh();
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      if (mapped.formMessage) {
        toast.error(mapped.formMessage);
      }
    },
  });

  return (
    <LoadingButton
      type="button"
      variant="outline"
      className="h-10"
      loading={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      {ACCOUNT_COPY.SIGN_OUT}
    </LoadingButton>
  );
}
