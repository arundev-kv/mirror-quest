import { describe, expect, it } from 'vitest';
import { generateRounds, getLevel, guideFloor, LEVELS, roundCount, screenSideForFacing, WORLDS } from '../levels';
import { getGlyph, GLYPHS } from '../glyphs';
import { isSymmetricUnder } from '../recognizer';
import { applyLevelResult, createProfile, isLevelUnlocked, lockReason } from '../profiles';
import { scoreLevel, type LevelResult } from '../scoring';
import type { Age } from '../types';

const AGES = [3, 4, 5, 6] as const;
const all = (age: Age) => LEVELS.flatMap((l) => [1, 2, 3].flatMap((seed) => generateRounds(l, age, seed)));
const pass = (rate = 1): LevelResult => ({ ...scoreLevel([]), score: 90, stars: 3, firstTryRate: rate });

describe('levels', () => {
  it('has 30 levels in 6 worlds of 5, with unique ids and known glyphs', () => {
    expect(LEVELS).toHaveLength(30);
    expect(new Set(LEVELS.map((l) => l.id)).size).toBe(30);
    for (const w of WORLDS) expect(LEVELS.filter((l) => l.world === w.number && l.theme === w.theme)).toHaveLength(5);
    for (const l of LEVELS) for (const r of l.recipe) for (const gl of r.glyphs ?? []) expect(GLYPHS[gl]).toBeDefined();
  });

  it('every fifth level is a mixed review', () => {
    for (const n of [5, 10, 15, 20, 25, 30]) expect(LEVELS[n - 1].interleave).toBe(true);
  });

  it('generates 8-12 scored rounds per level for every age (warm-ups excluded)', () => {
    for (const l of LEVELS)
      for (const age of AGES) {
        const scored = generateRounds(l, age, 42).filter((r) => r.kind !== 'body');
        expect(scored.length, `${l.id} age ${age}`).toBe(roundCount(l, age));
        expect(scored.length).toBeGreaterThanOrEqual(8);
        expect(scored.length).toBeLessThanOrEqual(12);
      }
  });

  it('puts warm-ups first, even in reviews', () => {
    for (const l of LEVELS) {
      const rounds = generateRounds(l, 5, 9);
      const firstScored = rounds.findIndex((r) => r.kind !== 'body');
      expect(rounds.slice(firstScored).some((r) => r.kind === 'body')).toBe(false);
    }
  });

  it('is reproducible with the same seed', () => {
    for (const l of LEVELS) expect(generateRounds(l, 5, 7)).toEqual(generateRounds(l, 5, 7));
  });

  it('pick and sequence rounds have exactly one correct option, and options look different', () => {
    for (const age of AGES)
      for (const r of all(age)) {
        if (r.kind === 'pick') {
          expect(r.options.filter((o) => o.correct)).toHaveLength(1);
          expect(r.options.length).toBeGreaterThanOrEqual(2);
          for (const o of r.options)
            if (!o.correct)
              expect(o.glyphId !== r.target || !isSymmetricUnder(getGlyph(o.glyphId), o.transform)).toBe(true);
        }
        if (r.kind === 'sequence') {
          expect(r.options.filter((o) => o.correct)).toHaveLength(1);
          const keys = r.options.map((o) => o.chars.map((c) => c.glyphId + c.transform).join());
          expect(new Set(keys).size).toBe(keys.length);
        }
      }
  });

  it('never shows b next to d (or p next to q) before world 5', () => {
    for (const l of LEVELS.filter((x) => x.world < 5))
      for (const r of generateRounds(l, 6, 1))
        if (r.kind === 'pick') expect(['b', 'd', 'p', 'q']).not.toContain(r.target);
  });

  it('adapts writing support to age: age 3 only traces, age 4 keeps a faint guide, diagonals stay traced', () => {
    for (const r of all(3)) if (r.kind === 'write') expect(r.guideOpacity).toBeGreaterThanOrEqual(0.6);
    for (const r of all(3)) if (r.kind === 'write') expect(r.modelMs).toBeUndefined();
    for (const r of all(4)) if (r.kind === 'write') expect(r.guideOpacity).toBeGreaterThanOrEqual(0.3);
    expect(guideFloor(4, '7')).toBe(0.6);
    expect(guideFloor(5, '7')).toBe(0);
    expect(all(5).some((r) => r.kind === 'write' && r.modelMs && r.guideOpacity === 0)).toBe(true);
  });

  it('keeps the left/right hint on for age 3', () => {
    for (const r of generateRounds(LEVELS[0], 3, 5)) if (r.kind === 'side') expect(r.hint).toBe(true);
    expect(generateRounds(LEVELS[0], 5, 5).some((r) => r.kind === 'side' && !r.hint)).toBe(true);
  });

  it('weights the grand review towards the most reversed characters', () => {
    const l30 = getLevel('L30')!;
    const count = (focus: string[]) =>
      [1, 2, 3, 4, 5, 6, 7, 8]
        .flatMap((s) => generateRounds(l30, 6, s, focus))
        .filter((r) => (r.kind === 'judge' || r.kind === 'write') && r.glyphId === '3').length;
    expect(count(['3'])).toBeGreaterThan(count([]));
  });

  it('mirrors left and right for a friend facing me', () => {
    expect(screenSideForFacing('left', 'front')).toBe('right');
    expect(screenSideForFacing('left', 'back')).toBe('left');
  });
});

describe('unlocking', () => {
  it('unlocks the next level at 2 stars (70+)', () => {
    let p = createProfile({ name: 'Ann', age: 4, avatarId: 'cat' }, 0, 'p1');
    expect(isLevelUnlocked(p, 'L01')).toBe(true);
    expect(isLevelUnlocked(p, 'L02')).toBe(false);
    p = applyLevelResult(p, 'L01', { ...scoreLevel([]), score: 69 }, 1);
    expect(isLevelUnlocked(p, 'L02')).toBe(false);
    p = applyLevelResult(p, 'L01', { ...scoreLevel([]), score: 70, stars: 2 }, 2);
    expect(isLevelUnlocked(p, 'L02')).toBe(true);
  });

  it('opens world 5 only after b, p, d and g/q are mastered on two different days', () => {
    const day = 24 * 3600_000;
    let p = createProfile({ name: 'Ann', age: 5, avatarId: 'cat' }, 0, 'p1');
    for (const l of LEVELS.slice(0, 20)) p = applyLevelResult(p, l.id, pass(0.5), day); // passed, not mastered
    expect(lockReason(p, 'L21')).toBe('mastery');
    for (const id of ['L07', 'L09', 'L13', 'L14']) p = applyLevelResult(p, id, pass(), day);
    expect(lockReason(p, 'L21')).toBe('mastery'); // only one day so far
    for (const id of ['L07', 'L09', 'L13']) p = applyLevelResult(p, id, pass(), day * 2);
    expect(lockReason(p, 'L21')).toBe('mastery');
    p = applyLevelResult(p, 'L14', pass(), day * 3);
    expect(lockReason(p, 'L21')).toBeNull();
  });

  it('locks level 29 below age 6 and lets younger children go on to level 30', () => {
    let p = createProfile({ name: 'Ann', age: 5, avatarId: 'cat' }, 0, 'p1');
    expect(lockReason(p, 'L29')).toBe('age');
    p = applyLevelResult(p, 'L28', pass(), 1);
    expect(lockReason(p, 'L30')).toBeNull();
    const six = { ...p, age: 6 as const };
    expect(lockReason(six, 'L29')).toBeNull();
    expect(lockReason(six, 'L30')).toBe('previous');
  });
});
