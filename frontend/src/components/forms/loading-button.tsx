import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';

type LoadingButtonProps = ComponentProps<typeof Button> & {
  pending?: boolean;
  loading?: boolean;
};

/** A button that shows a spinner beside its label and ignores clicks while a request is in flight. */
export function LoadingButton({
  pending = false,
  loading = false,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  const isPending = pending || loading;

  return (
    <Button disabled={isPending || disabled} aria-busy={isPending} {...props}>
      {isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}
      {children}
    </Button>
  );
}
