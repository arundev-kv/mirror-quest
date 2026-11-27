import { describe, expect, it } from 'vitest';
import { mergeBest, scoreLevel, starsFor, type RoundOutcome } from '../scoring';

const ok = (over: Partial<RoundOutcome> = {}): RoundOutcome => ({
  correct: true,
  tries: 1,
  timeMs: 1000,
  targetMs: 4000,
  ...over,
});

describe('scoring', () => {
  it('gives 100 and 3 stars for a perfect fast run', () => {
    const r = scoreLevel(Array.from({ length: 8 }, () => ok()));
    expect(r.score).toBe(100);
    expect(r.stars).toBe(3);
  });
  it('weights accuracy 70% and speed 30%', () => {
    const slow = scoreLevel([ok({ timeMs: 12_000 })]);
    expect(slow.score).toBe(70);
  });
  it('gives half credit on the second try', () => {
    expect(scoreLevel([ok({ tries: 2 })]).score).toBe(65);
  });
  it('always gives at least one star for finishing', () => {
    expect(starsFor(0)).toBe(1);
    expect(starsFor(70)).toBe(2);
    expect(starsFor(90)).toBe(3);
  });
  it('keeps the best score on retry', () => {
    const first = mergeBest(undefined, scoreLevel([ok()]), 1);
    const worse = mergeBest(first, scoreLevel([ok({ correct: false })]), 2);
    expect(worse.bestScore).toBe(100);
    expect(worse.attempts).toBe(2);
  });
});
