'use client';

import { useState, type ComponentProps } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FORMS_COPY } from '@/constants/copy/forms';
import { cn } from '@/lib/utils';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>;

/** Password field with a show and hide control. The label stays beside the input, not inside it. */
export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn('h-10 pr-16', className)}
      />
      <Button
        type="button"
        variant="ghost"
        className="absolute top-0 right-0 h-10 px-3"
        aria-pressed={visible}
        onClick={() => setVisible((current) => !current)}
      >
        {visible ? FORMS_COPY.HIDE_PASSWORD : FORMS_COPY.SHOW_PASSWORD}
      </Button>
    </div>
  );
}
