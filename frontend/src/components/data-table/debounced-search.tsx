'use client';

import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { SEARCH_DEBOUNCE_MS } from '@/constants';

export function DebouncedSearch({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      if (draft !== value) {
        onChange(draft);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timeoutId);
  }, [draft, onChange, value]);

  return (
    <label className="relative block min-w-48 flex-1">
      <span className="sr-only">{ADMIN_COPY.SEARCH}</span>
      <Search aria-hidden className="text-muted-foreground absolute top-3 left-2.5 size-4" />
      <Input
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={ADMIN_COPY.SEARCH}
        className="h-10 pl-8"
      />
    </label>
  );
}
