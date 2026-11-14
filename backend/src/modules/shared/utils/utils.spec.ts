import { TIME_FILTERS } from '../constants';
import { chunk } from './array.utils';
import { hashToken, parseBoolean } from './data.utils';
import { getDateRange, zonedDateTimeToUtc } from './date.utils';
import { renderEmailTemplate } from '../../emails/helpers';

describe('data helpers', () => {
  it('parses boolean query values and ignores unknown text', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('FALSE')).toBe(false);
    expect(parseBoolean('yes')).toBeUndefined();
    expect(parseBoolean('')).toBeUndefined();
  });

  it('hashes tokens with sha-256 so two tokens from one user stay distinct', () => {
    const first = hashToken('header.payload-one.sig');
    const second = hashToken('header.payload-two.sig');
    expect(first).toHaveLength(64);
    expect(first).not.toBe(second);
  });
});

describe('array helpers', () => {
  it('splits a list into fixed sizes', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
  });
});

describe('date helpers', () => {
  it('returns today as a local window ending just before midnight', () => {
    const now = new Date(2026, 0, 15, 12, 0, 0);
    const range = getDateRange(TIME_FILTERS.TODAY, undefined, undefined, now);
    expect(range.start).toEqual(new Date(2026, 0, 15));
    expect(range.end.getDate()).toBe(15);
  });

  it('converts a New York wall time in January to UTC', () => {
    const utc = zonedDateTimeToUtc('2026-01-15', '00:00:00', 'America/New_York');
    expect(utc.toISOString()).toBe('2026-01-15T05:00:00.000Z');
  });
});

describe('email templates', () => {
  it('escapes HTML in template data', async () => {
    const html = await renderEmailTemplate('sample', { name: '<script>' });
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });
});
