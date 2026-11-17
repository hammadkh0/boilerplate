'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

import { FormErrorAlert } from '@/components/forms/form-error-alert';
import { LoadingButton } from '@/components/forms/loading-button';
import { TextField } from '@/components/forms/text-field';
import { AUTH_COPY } from '@/constants/copy/auth';
import { ROUTES } from '@/constants';
import { applyMappedErrors, mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { forgotPasswordSchema, type ForgotPasswordValues } from '@/schemas/auth';
import { forgotPassword } from '@/services/auth.service';

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordValues) => forgotPassword(values.email),
    onSuccess: () => {
      setSent(true);
      toast.success(AUTH_COPY.FORGOT_SUCCESS);
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      applyMappedErrors(form.setError, mapped.fields, ['email']);
      setFormError(mapped.formMessage);
    },
  });

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={form.handleSubmit((values) => {
        setFormError(null);
        setSent(false);
        mutation.mutate(values);
      })}
    >
      <TextField
        id="email"
        label={AUTH_COPY.EMAIL}
        type="email"
        autoComplete="email"
        inputMode="email"
        error={form.formState.errors.email}
        {...form.register('email')}
      />
      {sent ? <p className="text-sm">{AUTH_COPY.FORGOT_SUCCESS}</p> : null}
      <FormErrorAlert message={formError} />
      <LoadingButton type="submit" className="h-10 w-full" loading={mutation.isPending}>
        {AUTH_COPY.FORGOT_SUBMIT}
      </LoadingButton>
      <Link
        href={ROUTES.LOGIN}
        className="text-primary inline-flex min-h-10 items-center text-sm underline-offset-4 hover:underline"
      >
        {AUTH_COPY.REGISTER_LOGIN}
      </Link>
    </form>
  );
}
