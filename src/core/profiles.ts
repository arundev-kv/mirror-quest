import { getLevel, isPlayableAtAge, LEVELS } from './levels';
import { isMastered, mergeBest, recordMastery, UNLOCK_SCORE, type LevelResult } from './scoring';
import { addActiveTime, freshUsage, localDateKey, recordHistory, rollover } from './time';
import type { Age, Profile } from './types';

export const AVATAR_IDS = [
  'cat',
  'bear',
  'bunny',
  'fox',
  'owl',
  'frog',
  'panda',
  'lion',
  'mouse',
  'penguin',
  'koala',
  'chick',
] as const;

export const MAX_NAME_LENGTH = 16;

export function createProfile(input: { name: string; age: Age; avatarId: string }, nowMs: number, id: string): Profile {
  return {
    id,
    name: input.name.trim().slice(0, MAX_NAME_LENGTH) || 'Friend',
    age: input.age,
    avatarId: input.avatarId,
    createdAt: nowMs,
    levels: {},
    reversals: {},
    usage: freshUsage(nowMs),
    history: {},
  };
}

export type LockReason = 'previous' | 'mastery' | 'age';

/**
 * Why a level is still closed, or null when it is open. A level opens when the previous playable level
 * scored 70+ (levels this child is too young for are skipped), and when every level it needs is mastered.
 */
export function lockReason(profile: Profile, levelId: string): LockReason | null {
  const i = LEVELS.findIndex((l) => l.id === levelId);
  if (i < 0) return 'previous';
  const level = LEVELS[i];
  if (!isPlayableAtAge(level, profile.age)) return 'age';
  let j = i - 1;
  while (j >= 0 && !isPlayableAtAge(LEVELS[j], profile.age)) j--;
  if (j >= 0) {
    const prev = profile.levels[LEVELS[j].id];
    if (!prev || prev.bestScore < UNLOCK_SCORE) return 'previous';
  }
  if (level.requiresMastery?.some((id) => !isMastered(profile.levels[id]))) return 'mastery';
  return null;
}

export function isLevelUnlocked(profile: Profile, levelId: string): boolean {
  return lockReason(profile, levelId) === null;
}

export function masteredCount(profile: Profile): number {
  return LEVELS.filter((l) => isMastered(profile.levels[l.id])).length;
}

export function totalPoints(profile: Profile): number {
  return Object.values(profile.levels).reduce((a, l) => a + l.bestScore, 0);
}

export function totalStars(profile: Profile): number {
  return Object.values(profile.levels).reduce((a, l) => a + l.bestStars, 0);
}

export function applyLevelResult(profile: Profile, levelId: string, result: LevelResult, nowMs: number): Profile {
  const prev = profile.levels[levelId];
  const criterion = getLevel(levelId)?.mastery ?? 0.8;
  const masteredOn = recordMastery(prev?.masteredOn, result.firstTryRate >= criterion, localDateKey(nowMs));
  return { ...profile, levels: { ...profile.levels, [levelId]: mergeBest(prev, result, nowMs, masteredOn) } };
}

export function addReversal(profile: Profile, key: string): Profile {
  return { ...profile, reversals: { ...profile.reversals, [key]: (profile.reversals[key] ?? 0) + 1 } };
}

export function tickUsage(profile: Profile, nowMs: number, activeMs: number): Profile {
  const usage = activeMs > 0 ? addActiveTime(profile.usage, nowMs, activeMs) : rollover(profile.usage, nowMs);
  return { ...profile, usage, history: recordHistory(profile.history, usage) };
}

/** Most reversed characters first. */
export function topReversals(profile: Profile, n = 6): [string, number][] {
  return Object.entries(profile.reversals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n);
}

/** The world of the furthest level this child can play (where the map opens). */
export function currentWorld(profile: Profile): number {
  let world = 1;
  for (const l of LEVELS) if (lockReason(profile, l.id) === null) world = l.world;
  return world;
}
