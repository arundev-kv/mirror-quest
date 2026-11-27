import type { DailyUsage } from './types';

/**
 * Daily play limit. Pure functions: the caller passes the current wall-clock
 * time and how much ACTIVE time passed (visible tab + recent input).
 */

export const MINUTE = 60_000;
export const DAILY_LIMIT_MS = 30 * MINUTE;
export const COUNTDOWN_AT_MS = 25 * MINUTE;
/** A level that is running when the limit hits may finish, for at most this long. */
export const GRACE_MS = 2 * MINUTE;
/** No input for this long pauses the clock. */
export const IDLE_AFTER_MS = 60_000;
/** Offer a stretch break every 10 minutes of play. */
export const BREAK_EVERY_MS = 10 * MINUTE;
/** Ignore tiny clock jitter when checking for a clock moved backwards. */
const CLOCK_SKEW_TOLERANCE_MS = 5 * MINUTE;

export type LimitPhase = 'play' | 'countdown' | 'grace' | 'locked';

/** YYYY-MM-DD in the device's local time zone (midnight = 12:00 AM local). */
export function localDateKey(ms: number): string {
  const d = new Date(ms);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function freshUsage(nowMs: number): DailyUsage {
  return { date: localDateKey(nowMs), usedMs: 0, lastWallMs: nowMs };
}

/**
 * Bring a stored usage record up to date with the current time:
 * - a new local day starts a fresh budget,
 * - a clock moved backwards (or a date earlier than the stored one) keeps the stored usage.
 */
export function rollover(usage: DailyUsage, nowMs: number): DailyUsage {
  const movedBack = nowMs < usage.lastWallMs - CLOCK_SKEW_TOLERANCE_MS;
  if (movedBack) return usage;
  const today = localDateKey(nowMs);
  if (today > usage.date) return freshUsage(nowMs);
  if (today < usage.date) return usage; // clock set to an earlier day: keep what we have
  return { ...usage, lastWallMs: Math.max(usage.lastWallMs, nowMs) };
}

/** Add active time. Returns the rolled-over usage with the time added. */
export function addActiveTime(usage: DailyUsage, nowMs: number, activeMs: number): DailyUsage {
  const current = rollover(usage, nowMs);
  // Never add more than real time could allow in one tick (protects against huge deltas).
  const delta = Math.max(0, Math.min(activeMs, 5_000));
  return { ...current, usedMs: current.usedMs + delta };
}

/** Is the child actively playing right now? */
export function isActive(opts: { visible: boolean; lastInputMs: number; nowMs: number }): boolean {
  return opts.visible && opts.nowMs - opts.lastInputMs < IDLE_AFTER_MS;
}

/**
 * Where are we in the daily budget?
 * levelStartedBeforeLimit: a level that was already running when the 30 minutes ran out.
 */
export function limitPhase(usedMs: number, levelStartedBeforeLimit: boolean): LimitPhase {
  if (usedMs < COUNTDOWN_AT_MS) return 'play';
  if (usedMs < DAILY_LIMIT_MS) return 'countdown';
  if (levelStartedBeforeLimit && usedMs < DAILY_LIMIT_MS + GRACE_MS) return 'grace';
  return 'locked';
}

/** 1 at the start of the countdown, 0 at the limit. Drives the setting-sun animation. */
export function countdownFraction(usedMs: number): number {
  if (usedMs <= COUNTDOWN_AT_MS) return 1;
  return Math.max(0, (DAILY_LIMIT_MS - usedMs) / (DAILY_LIMIT_MS - COUNTDOWN_AT_MS));
}

export function remainingMs(usedMs: number): number {
  return Math.max(0, DAILY_LIMIT_MS - usedMs);
}

/** Has a 10-minute break boundary been crossed between two usage readings? */
export function crossedBreak(beforeMs: number, afterMs: number): boolean {
  return Math.floor(afterMs / BREAK_EVERY_MS) > Math.floor(beforeMs / BREAK_EVERY_MS) && afterMs < DAILY_LIMIT_MS;
}

/** Record minutes for the parent dashboard; drop entries older than 30 days. */
export function recordHistory(history: Record<string, number>, usage: DailyUsage): Record<string, number> {
  const next = { ...history, [usage.date]: Math.round(usage.usedMs / MINUTE) };
  const keys = Object.keys(next).sort();
  while (keys.length > 30) delete next[keys.shift()!];
  return next;
}

/** The last n local dates ending today, oldest first. */
export function lastNDates(nowMs: number, n: number): string[] {
  const out: string[] = [];
  const d = new Date(nowMs);
  for (let i = n - 1; i >= 0; i--) {
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() - i, 12);
    out.push(localDateKey(x.getTime()));
  }
  return out;
}
