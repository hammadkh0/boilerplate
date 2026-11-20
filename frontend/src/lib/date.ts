import { format, type Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';

const defaultLocale: Locale = enUS;

export function formatDate(
  value: string | Date | null | undefined,
  locale: Locale = defaultLocale,
): string | null {
  if (value == null || value === '') {
    return null;
  }
  return format(new Date(value), 'PP', { locale });
}

export function formatDateTime(value: string | Date, locale: Locale = defaultLocale): string {
  return format(new Date(value), 'PPp', { locale });
}

/** Parses an API date as a local calendar date, ignoring the time of day. */
export function parseCalendarDate(value: string | null | undefined): Date | undefined {
  if (value == null || value === '') {
    return undefined;
  }
  const datePart = value.split('T')[0] ?? value;
  const [year, month, day] = datePart.split('-').map(Number);
  if (!year || !month || !day) {
    return undefined;
  }
  return new Date(year, month - 1, day);
}

/** The first instant of a calendar date, for an inclusive "from" filter. */
export function calendarDateStart(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  return `${value}T00:00:00.000Z`;
}

/**
 * The last instant of a calendar date.
 * A date-only "to" value would stop at midnight and hide the rest of that day.
 */
export function calendarDateEnd(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  return `${value}T23:59:59.999Z`;
}

/** Formats a local calendar date as YYYY-MM-DD for query params. */
export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getBrowserTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export type DateRangeValue = {
  from?: string;
  to?: string;
};

export function formatDateRangeLabel(
  value: DateRangeValue,
  locale: Locale = defaultLocale,
  emptyLabel = 'Pick dates',
): string {
  const from = parseCalendarDate(value.from);
  const to = parseCalendarDate(value.to);
  if (!from && !to) {
    return emptyLabel;
  }
  if (from && !to) {
    return format(from, 'PP', { locale });
  }
  if (!from && to) {
    return format(to, 'PP', { locale });
  }
  if (from && to && value.from === value.to) {
    return format(from, 'PP', { locale });
  }
  if (from && to) {
    return `${format(from, 'PP', { locale })} to ${format(to, 'PP', { locale })}`;
  }
  return emptyLabel;
}

/** Builds from, to, and timezone query params from a calendar range. */
export function buildDateRangeQuery(
  value: DateRangeValue,
  timezone = getBrowserTimeZone(),
): { from?: string; to?: string; timezone?: string } {
  const from = value.from?.trim();
  const to = value.to?.trim();
  if (!from && !to) {
    return {};
  }
  return {
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
    timezone,
  };
}
