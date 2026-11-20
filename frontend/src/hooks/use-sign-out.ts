'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ACCOUNT_COPY } from '@/constants/copy/account';
import { ROUTES } from '@/constants';
import { mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { USERS_QUERY_KEYS } from '@/queries/users';
import { logout } from '@/services/auth.service';

/** Clears the session, drops cached user data, and returns to the home page. */
export function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
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
}
