'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

import { FormErrorAlert } from '@/components/forms/form-error-alert';
import { LoadingButton } from '@/components/forms/loading-button';
import { PasswordField } from '@/components/forms/text-field';
import { AUTH_COPY } from '@/constants/copy/auth';
import { ROUTES } from '@/constants';
import { applyMappedErrors, mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { resetPasswordSchema, type ResetPasswordValues } from '@/schemas/auth';
import { resetPassword } from '@/services/auth.service';

export function ResetPasswordForm({ token }: { token: string | null }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: token ?? '', password: '', confirmPassword: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: ResetPasswordValues) => resetPassword(values),
    onSuccess: () => {
      toast.success(AUTH_COPY.RESET_SUCCESS);
      router.push(ROUTES.LOGIN);
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      applyMappedErrors(form.setError, mapped.fields, ['password', 'confirmPassword', 'token']);
      setFormError(mapped.formMessage);
    },
  });

  if (!token) {
    return (
      <div className="flex flex-col gap-4">
        <p>{AUTH_COPY.RESET_MISSING}</p>
        <Link
          href={ROUTES.FORGOT_PASSWORD}
          className="text-primary inline-flex min-h-10 items-center text-sm underline-offset-4 hover:underline"
        >
          {AUTH_COPY.RESET_REQUEST}
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) => {
        setFormError(null);
        mutation.mutate(values);
      })}
    >
      <input type="hidden" {...form.register('token')} />
      <PasswordField
        id="password"
        label={AUTH_COPY.NEW_PASSWORD}
        autoComplete="new-password"
        error={form.formState.errors.password}
        {...form.register('password')}
      />
      <PasswordField
        id="confirmPassword"
        label={AUTH_COPY.CONFIRM_PASSWORD}
        autoComplete="new-password"
        error={form.formState.errors.confirmPassword}
        {...form.register('confirmPassword')}
      />
      <FormErrorAlert message={formError} />
      <LoadingButton type="submit" className="h-10 w-full" loading={mutation.isPending}>
        {AUTH_COPY.RESET_SUBMIT}
      </LoadingButton>
    </form>
  );
}
