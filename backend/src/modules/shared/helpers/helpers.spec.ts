import { BadRequestException } from '@nestjs/common';

import { SORT_ORDER } from '../constants';
import { tombstoneIdentityValue } from '../../users/helpers';
import { sanitizeObject } from '../utils';
import {
  buildCursorArgs,
  buildCursorResult,
  buildOrderBy,
  buildPaginatedResult,
  buildPaginationArgs,
  buildPatchData,
  buildSearchWhere,
  requireDefined,
} from './index';

describe('pagination helpers', () => {
  it('clamps the page size and skips earlier rows', () => {
    expect(buildPaginationArgs({ page: 3, limit: 500 })).toEqual({ skip: 200, take: 100 });
  });

  it('returns offset metadata', () => {
    expect(buildPaginatedResult(['a'], 21, 2, 20)).toEqual({
      items: ['a'],
      meta: { page: 2, limit: 20, total: 21, totalPages: 2 },
    });
  });

  it('fetches one extra cursor row and reports another page', () => {
    expect(buildCursorArgs({ cursor: '018f6d4e-8c3a-7b2e-9a11-111111111111', limit: 2 })).toEqual({
      take: 3,
      skip: 1,
      cursor: { id: '018f6d4e-8c3a-7b2e-9a11-111111111111' },
    });

    const result = buildCursorResult(
      [
        { id: 'a', name: 'one' },
        { id: 'b', name: 'two' },
        { id: 'c', name: 'three' },
      ],
      2,
    );
    expect(result.items.map((item) => item.id)).toEqual(['a', 'b']);
    expect(result.meta).toEqual({ nextCursor: 'b', hasMore: true, limit: 2 });
  });

  it('builds a case-insensitive search or an empty filter', () => {
    expect(buildSearchWhere('  ', ['email'])).toEqual({});
    expect(buildSearchWhere('ada', ['email', 'fullName'])).toEqual({
      OR: [
        { email: { contains: 'ada', mode: 'insensitive' } },
        { fullName: { contains: 'ada', mode: 'insensitive' } },
      ],
    });
  });

  it('rejects a sort field outside the whitelist', () => {
    expect(() =>
      buildOrderBy('passwordHash', SORT_ORDER.ASC, ['createdAt'], { createdAt: 'desc' }),
    ).toThrow(BadRequestException);
    expect(buildOrderBy(undefined, undefined, ['createdAt'], { createdAt: 'desc' })).toEqual({
      createdAt: 'desc',
    });
  });
});

describe('query helpers', () => {
  it('throws when an owner filter is missing', () => {
    expect(() => requireDefined(undefined, 'ownerId')).toThrow('ownerId is required');
    expect(requireDefined('user-1', 'ownerId')).toBe('user-1');
  });

  it('keeps null and drops undefined in a patch', () => {
    expect(buildPatchData({ fullName: 'Ada', avatarKey: null, email: undefined })).toEqual({
      fullName: 'Ada',
      avatarKey: null,
    });
  });
});

describe('identity and redaction', () => {
  it('tombstones an email and can read the original back', () => {
    const userId = '018f6d4e-8c3a-7b2e-9a11-111111111111';
    const tombstone = tombstoneIdentityValue(userId, 'ada@example.com');
    expect(tombstone).toBe(`deleted.${userId}.ada@example.com`);
    expect(tombstoneIdentityValue(userId, tombstone)).toBe(tombstone);
  });

  it('redacts nested password fields', () => {
    expect(sanitizeObject({ user: { password: 'secret', name: 'Ada' } })).toEqual({
      user: { password: '[REDACTED]', name: 'Ada' },
    });
  });
});
