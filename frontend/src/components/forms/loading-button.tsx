import { Loader2 } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button } from '@/components/ui/button';

type LoadingButtonProps = ComponentProps<typeof Button> & {
  pending?: boolean;
};

/** A button that shows a spinner and ignores clicks while `pending` is true. */
export function LoadingButton({
  pending = false,
  disabled,
  children,
  ...props
}: LoadingButtonProps) {
  return (
    <Button disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending ? <Loader2 className="animate-spin" /> : null}
      {children}
    </Button>
  );
}
