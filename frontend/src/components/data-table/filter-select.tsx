'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ADMIN_COPY } from '@/constants/copy/admin';
import { FILTER_ALL } from '@/constants';

export function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string | null;
  options: readonly { value: string; label: string }[];
  onChange: (value: string | null) => void;
}) {
  return (
    <label className="flex min-w-36 flex-col gap-1 text-sm">
      {label}
      <Select
        value={value ?? FILTER_ALL}
        onValueChange={(next) => onChange(next === FILTER_ALL ? null : next)}
      >
        <SelectTrigger className="h-10 w-full" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={FILTER_ALL}>{ADMIN_COPY.ALL}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}
