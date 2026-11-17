'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { FormErrorAlert } from '@/components/forms/form-error-alert';
import { LoadingButton } from '@/components/forms/loading-button';
import { TextField } from '@/components/forms/text-field';
import { ACCOUNT_COPY } from '@/constants/copy/account';
import { AUTH_COPY } from '@/constants/copy/auth';
import { applyMappedErrors, mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { USERS_QUERY_KEYS } from '@/queries/users';
import { profileSchema, type ProfileValues } from '@/schemas/account';
import { updateMe } from '@/services/users.service';
import type { UserProfile } from '@/types';

export function ProfileForm({ user }: { user: UserProfile }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user.fullName },
  });
  const mutation = useMutation({
    mutationFn: (values: ProfileValues) => updateMe(values),
    onSuccess: (updated) => {
      queryClient.setQueryData(USERS_QUERY_KEYS.me, updated);
      toast.success(ACCOUNT_COPY.PROFILE_SUCCESS);
      router.refresh();
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      applyMappedErrors(form.setError, mapped.fields, ['fullName']);
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
      <FormErrorAlert message={formError} />
      <LoadingButton type="submit" className="h-10 w-full sm:w-auto" loading={mutation.isPending}>
        {ACCOUNT_COPY.PROFILE_SUBMIT}
      </LoadingButton>
    </form>
  );
}
