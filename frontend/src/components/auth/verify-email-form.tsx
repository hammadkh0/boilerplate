'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

import { FormErrorAlert } from '@/components/forms/form-error-alert';
import { LoadingButton } from '@/components/forms/loading-button';
import { AUTH_COPY } from '@/constants/copy/auth';
import { ROUTES } from '@/constants';
import { mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { verifyEmail } from '@/services/auth.service';

export function VerifyEmailForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const mutation = useMutation({
    mutationFn: (value: string) => verifyEmail(value),
    onSuccess: () => {
      toast.success(AUTH_COPY.VERIFY_SUCCESS);
      router.push(ROUTES.LOGIN);
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      setFormError(mapped.formMessage);
    },
  });

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <p>{AUTH_COPY.VERIFY_MISSING}</p>
        <Link
          href={ROUTES.REGISTER}
          className="text-primary inline-flex min-h-10 items-center text-sm underline-offset-4 hover:underline"
        >
          {AUTH_COPY.LOGIN_REGISTER}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <FormErrorAlert message={formError} />
      <LoadingButton
        type="button"
        className="h-10 w-full"
        loading={mutation.isPending}
        onClick={() => {
          setFormError(null);
          mutation.mutate(token);
        }}
      >
        {AUTH_COPY.VERIFY_SUBMIT}
      </LoadingButton>
    </div>
  );
}
