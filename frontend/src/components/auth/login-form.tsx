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
import { ROUTES } from '@/constants';
import { applyMappedErrors, mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { loginSchema, type LoginValues } from '@/schemas/auth';
import { login } from '@/services/auth.service';

export function LoginForm({ nextPath }: { nextPath: string | null }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: LoginValues) => login(values),
    onSuccess: () => {
      toast.success(AUTH_COPY.LOGIN_SUCCESS);
      router.push(nextPath ?? ROUTES.ACCOUNT);
      router.refresh();
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      applyMappedErrors(form.setError, mapped.fields, ['email', 'password']);
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
        autoComplete="current-password"
        error={form.formState.errors.password}
        {...form.register('password')}
      />
      <Link
        href={ROUTES.FORGOT_PASSWORD}
        className="text-primary inline-flex min-h-10 items-center text-sm underline-offset-4 hover:underline"
      >
        {AUTH_COPY.LOGIN_FORGOT}
      </Link>
      <FormErrorAlert message={formError} />
      <LoadingButton type="submit" className="h-10 w-full" loading={mutation.isPending}>
        {AUTH_COPY.LOGIN_SUBMIT}
      </LoadingButton>
      <p className="text-muted-foreground text-sm">
        {AUTH_COPY.LOGIN_REGISTER_LEAD}{' '}
        <Link href={ROUTES.REGISTER} className="text-primary underline-offset-4 hover:underline">
          {AUTH_COPY.LOGIN_REGISTER}
        </Link>
      </p>
    </form>
  );
}
