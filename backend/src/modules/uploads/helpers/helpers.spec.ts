import { buildStorageKey } from './index';

describe('buildStorageKey', () => {
  it('uses a generated id and ignores any client filename', () => {
    const key = buildStorageKey('avatars', 'webp');
    expect(key).toMatch(/^avatars\/[0-9a-f-]{36}\.webp$/);
    expect(key).not.toContain('photo');
  });

  it('rejects a folder that could escape the prefix', () => {
    expect(() => buildStorageKey('../secrets', 'webp')).toThrow('Invalid storage key');
  });
});
