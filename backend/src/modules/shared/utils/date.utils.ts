import { BadRequestException } from '@nestjs/common';
import { fromZonedTime } from 'date-fns-tz';

import { DATE_KEY_REGEX, TIME_FILTERS } from '../constants';
import type { CalendarDateRangeBounds, CalendarMonthRanges, DateRange, TimeFilter } from '../types';

export function getDateString(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatLongDateEnGb(date: Date | null | undefined): string | undefined {
  if (!date) {
    return undefined;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

/**
 * Inclusive local-time window for a named filter.
 * `CUSTOM` throws when either bound is missing.
 */
export function getDateRange(
  timeFilter: TimeFilter,
  startDate?: string,
  endDate?: string,
  now: Date = new Date(),
): DateRange {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (timeFilter) {
    case TIME_FILTERS.TODAY:
      return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) };
    case TIME_FILTERS.YESTERDAY: {
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return { start: yesterday, end: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1) };
    }
    case TIME_FILTERS.LAST_7_DAYS:
      return { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), end: now };
    case TIME_FILTERS.LAST_30_DAYS:
      return { start: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), end: now };
    case TIME_FILTERS.LAST_MONTH: {
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { start: firstDayLastMonth, end: lastDayLastMonth };
    }
    case TIME_FILTERS.CUSTOM: {
      if (!startDate || !endDate) {
        throw new BadRequestException('Start date and end date are required for a custom filter');
      }
      return { start: new Date(startDate), end: new Date(endDate) };
    }
    default: {
      const unexpected: never = timeFilter;
      throw new BadRequestException(`Unknown time filter: ${String(unexpected)}`);
    }
  }
}

export function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}

/** UTC calendar-month windows. The end bound is exclusive. */
export function getCalendarMonthRanges(reference = new Date()): CalendarMonthRanges {
  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth();
  const thisMonthStart = new Date(Date.UTC(year, month, 1));
  const thisMonthEnd = new Date(Date.UTC(year, month + 1, 1));
  const lastMonthStart = new Date(Date.UTC(year, month - 1, 1));

  return {
    thisMonthStart,
    thisMonthEnd,
    lastMonthStart,
    lastMonthEnd: thisMonthStart,
  };
}

/** Calendar day key `YYYY-MM-DD` in an IANA timezone. */
export function getDayKeyInTimeZone(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/** Previous calendar day key in the same timezone, including across DST changes. */
export function getPreviousDayKeyInTimeZone(dayKey: string, timeZone: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  let probe = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1, 12));

  for (let hour = 0; hour < 48; hour += 1) {
    probe = new Date(probe.getTime() - 60 * 60 * 1000);
    const candidate = getDayKeyInTimeZone(probe, timeZone);
    if (candidate !== dayKey) {
      return candidate;
    }
  }

  throw new Error(`Unable to resolve the previous day for ${dayKey} (${timeZone})`);
}

export function startOfUtcDay(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function startOfUtcMonth(date = new Date()): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
}

export function isValidIanaTimeZone(timeZone: string): boolean {
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

function assertDateKey(value: string, field: string): void {
  if (!DATE_KEY_REGEX.test(value)) {
    throw new BadRequestException(`${field} must be YYYY-MM-DD`);
  }
}

/**
 * Converts a wall-clock time in an IANA timezone to a UTC `Date`.
 * `time` is `HH:mm`, `HH:mm:ss`, or `HH:mm:ss.SSS`.
 */
export function zonedDateTimeToUtc(dayKey: string, time: string, timeZone: string): Date {
  assertDateKey(dayKey, 'dayKey');
  if (!isValidIanaTimeZone(timeZone)) {
    throw new BadRequestException(`Invalid timezone: ${timeZone}`);
  }

  const [hours = '00', minutes = '00', seconds = '00'] = time.split(':');
  return fromZonedTime(`${dayKey}T${hours}:${minutes}:${seconds}`, timeZone);
}

/**
 * Inclusive calendar bounds in a timezone.
 * A single `from` or `to` covers that one day.
 */
export function resolveCalendarDateRangeBounds(
  from?: string,
  to?: string,
  timeZone = 'UTC',
): CalendarDateRangeBounds | undefined {
  if (!from && !to) {
    return undefined;
  }
  if (!isValidIanaTimeZone(timeZone)) {
    throw new BadRequestException(`Invalid timezone: ${timeZone}`);
  }

  const startDay = from ?? to;
  const endDay = to ?? from;
  if (!startDay || !endDay) {
    return undefined;
  }
  if (from) {
    assertDateKey(from, 'from');
  }
  if (to) {
    assertDateKey(to, 'to');
  }
  if (startDay > endDay) {
    throw new BadRequestException('from must be on or before to');
  }

  return {
    gte: zonedDateTimeToUtc(startDay, '00:00:00.000', timeZone),
    lte: zonedDateTimeToUtc(endDay, '23:59:59.999', timeZone),
  };
}
