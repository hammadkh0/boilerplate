import { requestLogCutoff } from './index';

describe('requestLogCutoff', () => {
  it('subtracts the retention window from the given instant', () => {
    const now = new Date('2026-03-31T00:00:00.000Z');
    expect(requestLogCutoff(now, 30).toISOString()).toBe('2026-03-01T00:00:00.000Z');
  });
});
