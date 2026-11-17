'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useMutation } from '@tanstack/react-query';

import { FormErrorAlert } from '@/components/forms/form-error-alert';
import { LoadingButton } from '@/components/forms/loading-button';
import { Button } from '@/components/ui/button';
import { MARKETING_COPY } from '@/constants/copy/marketing';
import { RESEND_COOLDOWN_MS, ROUTES } from '@/constants';
import { mapApiFieldErrors } from '@/lib/map-api-field-errors';
import { resendVerification } from '@/services/auth.service';

export function ThankYouPanel({ email }: { email: string | null }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const mutation = useMutation({
    mutationFn: (value: string) => resendVerification(value),
    onSuccess: () => {
      setCooldownUntil(Date.now() + RESEND_COOLDOWN_MS);
      toast.success(MARKETING_COPY.THANK_YOU_RESEND);
    },
    onError: (error) => {
      const mapped = mapApiFieldErrors(error);
      setFormError(mapped.formMessage);
    },
  });

  useEffect(() => {
    if (cooldownUntil == null) {
      return;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  const remaining =
    cooldownUntil == null ? 0 : Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-12">
      <h1 className="text-3xl font-semibold">{MARKETING_COPY.THANK_YOU_TITLE}</h1>
      <p className="text-muted-foreground">
        {email ? MARKETING_COPY.THANK_YOU_BODY(email) : MARKETING_COPY.THANK_YOU_BODY_NO_EMAIL}
      </p>
      {email ? (
        <>
          <FormErrorAlert message={formError} />
          <LoadingButton
            type="button"
            className="h-10 w-full sm:w-auto"
            loading={mutation.isPending}
            disabled={remaining > 0}
            onClick={() => {
              setFormError(null);
              mutation.mutate(email);
            }}
          >
            {remaining > 0
              ? MARKETING_COPY.THANK_YOU_RESEND_WAIT(remaining)
              : MARKETING_COPY.THANK_YOU_RESEND}
          </LoadingButton>
        </>
      ) : (
        <p className="text-sm">{MARKETING_COPY.THANK_YOU_MISSING_EMAIL}</p>
      )}
      <Button variant="outline" asChild className="h-10 w-full sm:w-auto">
        <Link href={ROUTES.LOGIN}>{MARKETING_COPY.THANK_YOU_LOGIN}</Link>
      </Button>
    </div>
  );
}
