import { describe, expect, it } from 'vitest';
import {
  isMastered,
  mergeBest,
  recordMastery,
  scoreLevel,
  speedWeightForAge,
  starsFor,
  type RoundOutcome,
} from '../scoring';

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
  it('weights speed 0 / 10 / 15 / 20% for ages 3 / 4 / 5 / 6', () => {
    expect(speedWeightForAge(3)).toBe(0);
    expect(speedWeightForAge(4)).toBe(0.1);
    expect(speedWeightForAge(5)).toBe(0.15);
    expect(speedWeightForAge(6)).toBe(0.2);
    const slow = [ok({ timeMs: 12_000 })]; // speed 0, accuracy 1
    expect(scoreLevel(slow, 0.1).score).toBe(90);
    expect(scoreLevel(slow, 0.2).score).toBe(80);
  });
  it('never times handwriting: a slow writing round still scores 100', () => {
    expect(scoreLevel([ok({ timeMs: 60_000, timed: false })], 0.2).score).toBe(100);
    // Mixed: speed only weighs in proportion to the timed rounds.
    const mixed = [ok({ timeMs: 60_000, timed: false }), ok({ timeMs: 60_000 })];
    expect(scoreLevel(mixed, 0.2).score).toBe(90);
  });
  it('measures the first-try rate for mastery (a wrong start does not count)', () => {
    const r = scoreLevel([ok(), ok({ tries: 2 }), ok({ goodStart: false }), ok({ correct: false })]);
    expect(r.firstTryRate).toBe(0.25);
  });
  it('records mastery days once per day, and mastered means two days', () => {
    expect(recordMastery([], true, '2026-01-01')).toEqual(['2026-01-01']);
    expect(recordMastery(['2026-01-01'], true, '2026-01-01')).toEqual(['2026-01-01']);
    expect(recordMastery(['2026-01-01'], false, '2026-01-02')).toEqual(['2026-01-01']);
    const two = recordMastery(['2026-01-01'], true, '2026-01-02');
    expect(isMastered({ ...mergeBest(undefined, scoreLevel([ok()]), 1), masteredOn: two })).toBe(true);
    expect(isMastered({ ...mergeBest(undefined, scoreLevel([ok()]), 1), masteredOn: ['2026-01-01'] })).toBe(false);
  });
  it('gives half credit on the second try', () => {
    expect(scoreLevel([ok({ tries: 2 })], 0.2).score).toBe(60);
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
