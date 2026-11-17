'use client';

import { Input } from '@/components/ui/input';

export function DateFilter({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex min-w-36 flex-col gap-1 text-sm">
      {label}
      <Input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10"
      />
    </label>
  );
}
