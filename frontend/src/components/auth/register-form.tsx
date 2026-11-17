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
import { PasswordField, TextField } from '@/components/forms/text-field';
import { AUTH_COPY } from '@/constants/copy/auth';
import { MARKETING_COPY } from '@/constants/copy/marketing';
import { ROUTES } from '@/constants';
import { applyMappedErrors, mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { registerSchema, type RegisterValues } from '@/schemas/auth';
import { register } from '@/services/auth.service';

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', fullName: '', password: '', confirmPassword: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: RegisterValues) => register(values),
    onSuccess: (_result, values) => {
      toast.success(AUTH_COPY.REGISTER_SUCCESS);
      router.push(`${ROUTES.THANK_YOU}?email=${encodeURIComponent(values.email)}`);
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      applyMappedErrors(form.setError, mapped.fields, [
        'email',
        'fullName',
        'password',
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
      <TextField
        id="fullName"
        label={AUTH_COPY.FULL_NAME}
        autoComplete="name"
        error={form.formState.errors.fullName}
        {...form.register('fullName')}
      />
      <TextField
        id="email"
        label={AUTH_COPY.EMAIL}
        type="email"
        autoComplete="email"
        inputMode="email"
        error={form.formState.errors.email}
        {...form.register('email')}
      />
      <PasswordField
        id="password"
        label={AUTH_COPY.PASSWORD}
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
      <p className="text-muted-foreground text-sm">
        {AUTH_COPY.LEGAL_LEAD}{' '}
        <Link href={ROUTES.PRIVACY} className="text-primary underline-offset-4 hover:underline">
          {MARKETING_COPY.FOOTER_PRIVACY}
        </Link>{' '}
        {AUTH_COPY.LEGAL_AND}{' '}
        <Link href={ROUTES.TERMS} className="text-primary underline-offset-4 hover:underline">
          {MARKETING_COPY.FOOTER_TERMS}
        </Link>
        .
      </p>
      <FormErrorAlert message={formError} />
      <LoadingButton type="submit" className="h-10 w-full" loading={mutation.isPending}>
        {AUTH_COPY.REGISTER_SUBMIT}
      </LoadingButton>
      <p className="text-muted-foreground text-sm">
        {AUTH_COPY.REGISTER_LOGIN_LEAD}{' '}
        <Link href={ROUTES.LOGIN} className="text-primary underline-offset-4 hover:underline">
          {AUTH_COPY.REGISTER_LOGIN}
        </Link>
      </p>
    </form>
  );
}
