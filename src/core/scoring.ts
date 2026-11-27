import type { LevelProgress, Stars } from './types';

export interface RoundOutcome {
  correct: boolean;
  /** 1 = right first time, 2 = right after a gentle hint. */
  tries: number;
  timeMs: number;
  /** Speed target for this round type; anything at or under it is "fast". */
  targetMs: number;
  /** Handwriting only: started at the right spot and went the right way. */
  goodStart?: boolean;
  /** Counts towards the speed share. Handwriting is never timed. Defaults to true. */
  timed?: boolean;
}

export interface LevelResult {
  score: number;
  accuracy: number;
  speed: number;
  stars: Stars;
  totalTimeMs: number;
  /** Share of rounds right first time (and from the right start): the mastery measure. */
  firstTryRate: number;
}

/**
 * Speed matters little: time pressure raises anxiety and errors in young children with
 * learning difficulties. Age 3: none at all (time is still stored for parents).
 */
export function speedWeightForAge(age: number): number {
  if (age <= 3) return 0;
  if (age === 4) return 0.1;
  if (age === 5) return 0.15;
  return 0.2;
}
/** Minimum score to unlock the next level (2 stars). */
export const UNLOCK_SCORE = 70;
export const THREE_STAR_SCORE = 90;

export function roundAccuracy(o: RoundOutcome): number {
  if (!o.correct) return 0;
  let acc = o.tries <= 1 ? 1 : 0.5;
  if (o.goodStart === false) acc *= 0.85;
  return acc;
}

/** 1 when at or under target, falling gently to 0 at three times the target. */
export function roundSpeed(o: RoundOutcome): number {
  if (o.timeMs <= o.targetMs) return 1;
  return Math.max(0, 1 - (o.timeMs - o.targetMs) / (o.targetMs * 2));
}

export function starsFor(score: number): Stars {
  if (score >= THREE_STAR_SCORE) return 3;
  if (score >= UNLOCK_SCORE) return 2;
  return 1; // finishing a level always earns a star
}

export const isFirstTry = (o: RoundOutcome) => o.correct && o.tries <= 1 && o.goodStart !== false;

export function scoreLevel(outcomes: RoundOutcome[], speedWeight = 0.2): LevelResult {
  if (outcomes.length === 0) return { score: 0, accuracy: 0, speed: 0, stars: 1, totalTimeMs: 0, firstTryRate: 0 };
  const accuracy = outcomes.reduce((a, o) => a + roundAccuracy(o), 0) / outcomes.length;
  // Speed only counts for timed rounds the child got right, so rushing doesn't pay.
  const timed = outcomes.filter((o) => o.timed !== false);
  const speed = timed.length ? timed.reduce((a, o) => a + (o.correct ? roundSpeed(o) : 0), 0) / timed.length : 0;
  // The speed share shrinks with the share of untimed (handwriting) rounds: a writing level is all accuracy.
  const w = speedWeight * (timed.length / outcomes.length);
  const score = Math.round(100 * ((1 - w) * accuracy + w * speed));
  return {
    score,
    accuracy,
    speed,
    stars: starsFor(score),
    totalTimeMs: outcomes.reduce((a, o) => a + o.timeMs, 0),
    firstTryRate: outcomes.filter(isFirstTry).length / outcomes.length,
  };
}

/** Days on which the mastery criterion must be met (recall on a second day = learned, not just warm). */
export const MASTERY_DAYS = 2;

export function isMastered(p: LevelProgress | undefined): boolean {
  return !!p && (p.masteredOn?.length ?? 0) >= MASTERY_DAYS;
}

/** Add today's date when the run met the level's mastery criterion. Keeps the latest few distinct dates. */
export function recordMastery(prev: string[] | undefined, met: boolean, dateKey: string): string[] {
  const days = prev ?? [];
  if (!met || days.includes(dateKey)) return days;
  return [...days, dateKey].slice(-5);
}

/** Retries keep the best score (ties keep the faster time). */
export function mergeBest(
  prev: LevelProgress | undefined,
  result: LevelResult,
  now: number,
  masteredOn: string[] = prev?.masteredOn ?? [],
): LevelProgress {
  if (!prev) {
    return {
      bestScore: result.score,
      bestStars: result.stars,
      attempts: 1,
      bestTimeMs: result.totalTimeMs,
      lastPlayedAt: now,
      masteredOn,
    };
  }
  const better =
    result.score > prev.bestScore ||
    (result.score === prev.bestScore && (prev.bestTimeMs === null || result.totalTimeMs < prev.bestTimeMs));
  return {
    bestScore: better ? result.score : prev.bestScore,
    bestStars: better ? result.stars : prev.bestStars,
    bestTimeMs: better ? result.totalTimeMs : prev.bestTimeMs,
    attempts: prev.attempts + 1,
    lastPlayedAt: now,
    masteredOn,
  };
}
