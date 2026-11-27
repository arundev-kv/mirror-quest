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
}

export interface LevelResult {
  score: number;
  accuracy: number;
  speed: number;
  stars: Stars;
  totalTimeMs: number;
}

/**
 * Speed matters little: time pressure raises anxiety and errors in young children with
 * learning difficulties. Younger children get even less weight on speed.
 */
export function speedWeightForAge(age: number): number {
  return age <= 4 ? 0.1 : 0.2;
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

export function scoreLevel(outcomes: RoundOutcome[], speedWeight = 0.2): LevelResult {
  if (outcomes.length === 0) return { score: 0, accuracy: 0, speed: 0, stars: 1, totalTimeMs: 0 };
  const accuracy = outcomes.reduce((a, o) => a + roundAccuracy(o), 0) / outcomes.length;
  // Speed only counts for rounds the child got right, so rushing doesn't pay.
  const speed = outcomes.reduce((a, o) => a + (o.correct ? roundSpeed(o) : 0), 0) / outcomes.length;
  const score = Math.round(100 * ((1 - speedWeight) * accuracy + speedWeight * speed));
  return {
    score,
    accuracy,
    speed,
    stars: starsFor(score),
    totalTimeMs: outcomes.reduce((a, o) => a + o.timeMs, 0),
  };
}

/** Retries keep the best score (ties keep the faster time). */
export function mergeBest(prev: LevelProgress | undefined, result: LevelResult, now: number): LevelProgress {
  if (!prev) {
    return {
      bestScore: result.score,
      bestStars: result.stars,
      attempts: 1,
      bestTimeMs: result.totalTimeMs,
      lastPlayedAt: now,
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
  };
}
