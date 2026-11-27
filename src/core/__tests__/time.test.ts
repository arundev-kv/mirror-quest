import { describe, expect, it } from 'vitest';
import {
  addActiveTime,
  COUNTDOWN_AT_MS,
  countdownFraction,
  crossedBreak,
  DAILY_LIMIT_MS,
  freshUsage,
  GRACE_MS,
  isActive,
  lastNDates,
  limitPhase,
  localDateKey,
  MINUTE,
  rollover,
} from '../time';

const at = (y: number, mo: number, d: number, h = 0, mi = 0) => new Date(y, mo - 1, d, h, mi).getTime();

describe('midnight reset', () => {
  it('resets usage at local midnight', () => {
    const evening = at(2026, 11, 27, 23, 50);
    const usage = { ...freshUsage(evening), usedMs: 29 * MINUTE };
    const after = rollover(usage, at(2026, 11, 28, 0, 1));
    expect(after.usedMs).toBe(0);
    expect(after.date).toBe('2026-11-28');
  });

  it('keeps usage within the same day', () => {
    const usage = { ...freshUsage(at(2026, 11, 27, 9)), usedMs: 10 * MINUTE };
    expect(rollover(usage, at(2026, 11, 27, 23, 59)).usedMs).toBe(10 * MINUTE);
  });

  it('keeps usage when the clock is moved backwards', () => {
    const now = at(2026, 11, 27, 15);
    const usage = { ...freshUsage(now), usedMs: 30 * MINUTE };
    expect(rollover(usage, at(2026, 11, 26, 15)).usedMs).toBe(30 * MINUTE);
    expect(rollover(usage, now - 60 * MINUTE).usedMs).toBe(30 * MINUTE);
  });

  it('formats local dates', () => {
    expect(localDateKey(at(2026, 1, 5, 0, 0))).toBe('2026-01-05');
  });
});

describe('active time', () => {
  it('adds active time and caps a single tick', () => {
    const now = at(2026, 11, 27, 10);
    const u = addActiveTime(freshUsage(now), now + 1000, 1000);
    expect(u.usedMs).toBe(1000);
    expect(addActiveTime(u, now + 2000, 60 * MINUTE).usedMs).toBe(6000);
  });

  it('pauses when the tab is hidden or idle for 60s', () => {
    const now = 1_000_000;
    expect(isActive({ visible: true, lastInputMs: now - 10_000, nowMs: now })).toBe(true);
    expect(isActive({ visible: false, lastInputMs: now, nowMs: now })).toBe(false);
    expect(isActive({ visible: true, lastInputMs: now - 60_000, nowMs: now })).toBe(false);
  });
});

describe('limit phases', () => {
  it('plays freely before 25 minutes', () => {
    expect(limitPhase(COUNTDOWN_AT_MS - 1, false)).toBe('play');
  });
  it('shows the countdown from 25 minutes', () => {
    expect(limitPhase(COUNTDOWN_AT_MS, false)).toBe('countdown');
    expect(countdownFraction(COUNTDOWN_AT_MS)).toBe(1);
    expect(countdownFraction(27.5 * MINUTE)).toBeCloseTo(0.5);
  });
  it('locks at 30 minutes', () => {
    expect(limitPhase(DAILY_LIMIT_MS, false)).toBe('locked');
  });
  it('lets a running level finish, for at most 2 minutes', () => {
    expect(limitPhase(DAILY_LIMIT_MS + 1, true)).toBe('grace');
    expect(limitPhase(DAILY_LIMIT_MS + GRACE_MS, true)).toBe('locked');
  });
  it('detects 10-minute stretch breaks', () => {
    expect(crossedBreak(9.9 * MINUTE, 10.1 * MINUTE)).toBe(true);
    expect(crossedBreak(10.1 * MINUTE, 10.2 * MINUTE)).toBe(false);
  });
  it('lists the last 14 days', () => {
    const days = lastNDates(at(2026, 3, 2, 10), 14);
    expect(days).toHaveLength(14);
    expect(days[13]).toBe('2026-03-02');
    expect(days[12]).toBe('2026-03-01');
  });
});
