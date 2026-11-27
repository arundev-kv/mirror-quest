import { describe, expect, it } from 'vitest';
import { generateRounds, LEVELS, roundCount, screenSideForFacing } from '../levels';
import { GLYPHS } from '../glyphs';
import { createProfile, isLevelUnlocked, applyLevelResult } from '../profiles';
import { scoreLevel } from '../scoring';

describe('levels', () => {
  it('has unique ids and known glyphs', () => {
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(LEVELS.length);
    for (const l of LEVELS) for (const r of l.recipe) for (const gl of r.glyphs ?? []) expect(GLYPHS[gl]).toBeDefined();
  });
  it('generates 8-12 rounds per level for every age', () => {
    for (const l of LEVELS)
      for (const age of [3, 4, 5, 6] as const) {
        const n = generateRounds(l, age, 42).length;
        expect(n).toBe(roundCount(l, age));
        expect(n).toBeGreaterThanOrEqual(8);
        expect(n).toBeLessThanOrEqual(12);
      }
  });
  it('is reproducible with the same seed', () => {
    expect(generateRounds(LEVELS[1], 5, 7)).toEqual(generateRounds(LEVELS[1], 5, 7));
  });
  it('pick rounds always contain the correct option once', () => {
    for (const r of generateRounds(LEVELS[1], 6, 3))
      if (r.kind === 'pick') expect(r.options.filter((o) => o === 'identity')).toHaveLength(1);
  });
  it('mirrors left and right for a friend facing me', () => {
    expect(screenSideForFacing('left', 'front')).toBe('right');
    expect(screenSideForFacing('left', 'back')).toBe('left');
  });
  it('unlocks the next level at 2 stars (70+)', () => {
    let p = createProfile({ name: 'Ann', age: 4, avatarId: 'cat' }, 0, 'p1');
    expect(isLevelUnlocked(p, 'L01')).toBe(true);
    expect(isLevelUnlocked(p, 'L02')).toBe(false);
    p = applyLevelResult(p, 'L01', { ...scoreLevel([]), score: 69 }, 1);
    expect(isLevelUnlocked(p, 'L02')).toBe(false);
    p = applyLevelResult(p, 'L01', { ...scoreLevel([]), score: 70, stars: 2 }, 2);
    expect(isLevelUnlocked(p, 'L02')).toBe(true);
  });
});
