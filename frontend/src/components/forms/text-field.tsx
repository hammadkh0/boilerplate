'use client';

import type { ComponentProps } from 'react';

import { PasswordInput } from '@/components/forms/password-input';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type FieldErrorValue = { message?: string } | undefined;

type TextFieldProps = ComponentProps<typeof Input> & {
  label: string;
  error?: FieldErrorValue;
};

type PasswordFieldProps = ComponentProps<typeof PasswordInput> & {
  label: string;
  error?: FieldErrorValue;
};

function describedBy(id: string | undefined, error: FieldErrorValue): string | undefined {
  if (!id || !error?.message) {
    return undefined;
  }
  return `${id}-error`;
}

export function TextField({ id, label, error, className, ...props }: TextFieldProps) {
  const errorId = describedBy(id, error);

  return (
    <Field data-invalid={error?.message ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        aria-invalid={error?.message ? true : undefined}
        aria-describedby={errorId}
        className={cn('h-10', className)}
        {...props}
      />
      <FieldError id={errorId} errors={[error]} />
    </Field>
  );
}

export function PasswordField({ id, label, error, ...props }: PasswordFieldProps) {
  const errorId = describedBy(id, error);

  return (
    <Field data-invalid={error?.message ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <PasswordInput
        id={id}
        aria-invalid={error?.message ? true : undefined}
        aria-describedby={errorId}
        {...props}
      />
      <FieldError id={errorId} errors={[error]} />
    </Field>
  );
}
