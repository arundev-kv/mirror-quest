import { describe, expect, it } from 'vitest';
import { createProfile } from '../profiles';
import { defaultData, mergeImported, migrate, parseImport, serializeExport } from '../storage';

describe('storage', () => {
  it('returns defaults for garbage', () => {
    expect(migrate(null, 0)).toEqual(defaultData());
    expect(migrate('x', 1).profiles).toEqual([]);
  });
  it('drops invalid profiles and clamps settings', () => {
    const d = migrate(
      {
        profiles: [{ nope: 1 }, createProfile({ name: 'Ann', age: 4, avatarId: 'owl' }, 0, 'a')],
        settings: { musicVolume: 9 },
      },
      1,
    );
    expect(d.profiles).toHaveLength(1);
    expect(d.settings.musicVolume).toBe(1);
  });
  it('round-trips an export', () => {
    const p = createProfile({ name: 'Ben', age: 6, avatarId: 'fox' }, 0, 'b');
    expect(parseImport(serializeExport([p], 1))[0]).toEqual(p);
  });
  it('rejects files that are not backups', () => {
    expect(() => parseImport('{"hello":1}')).toThrow();
    expect(() => parseImport('not json')).toThrow();
  });
  it('merges imported profiles by id', () => {
    const a = createProfile({ name: 'A', age: 3, avatarId: 'cat' }, 0, '1');
    const b = createProfile({ name: 'B', age: 3, avatarId: 'cat' }, 0, '2');
    const a2 = { ...a, name: 'A2' };
    expect(mergeImported([a, b], [a2]).map((p) => p.name)).toEqual(['A2', 'B']);
  });
});
