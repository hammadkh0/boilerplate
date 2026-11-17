'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

import { FormErrorAlert } from '@/components/forms/form-error-alert';
import { LoadingButton } from '@/components/forms/loading-button';
import { PasswordField } from '@/components/forms/text-field';
import { ACCOUNT_COPY } from '@/constants/copy/account';
import { AUTH_COPY } from '@/constants/copy/auth';
import { applyMappedErrors, mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { changePasswordSchema, type ChangePasswordValues } from '@/schemas/auth';
import { changePassword } from '@/services/auth.service';

export function ChangePasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: ChangePasswordValues) => changePassword(values),
    onSuccess: () => {
      form.reset();
      toast.success(ACCOUNT_COPY.PASSWORD_SUCCESS);
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      applyMappedErrors(form.setError, mapped.fields, [
        'currentPassword',
        'newPassword',
        'confirmPassword',
      ]);
      setFormError(mapped.formMessage);
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) => {
        setFormError(null);
        mutation.mutate(values);
      })}
    >
      <PasswordField
        id="currentPassword"
        label={AUTH_COPY.CURRENT_PASSWORD}
        autoComplete="current-password"
        error={form.formState.errors.currentPassword}
        {...form.register('currentPassword')}
      />
      <PasswordField
        id="newPassword"
        label={AUTH_COPY.NEW_PASSWORD}
        autoComplete="new-password"
        error={form.formState.errors.newPassword}
        {...form.register('newPassword')}
      />
      <PasswordField
        id="confirmPassword"
        label={AUTH_COPY.CONFIRM_PASSWORD}
        autoComplete="new-password"
        error={form.formState.errors.confirmPassword}
        {...form.register('confirmPassword')}
      />
      <FormErrorAlert message={formError} />
      <LoadingButton type="submit" className="h-10 w-full sm:w-auto" loading={mutation.isPending}>
        {ACCOUNT_COPY.PASSWORD_SUBMIT}
      </LoadingButton>
    </form>
  );
}
