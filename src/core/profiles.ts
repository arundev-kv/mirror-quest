import { LEVELS } from './levels';
import { mergeBest, UNLOCK_SCORE, type LevelResult } from './scoring';
import { addActiveTime, freshUsage, recordHistory, rollover } from './time';
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

export function isLevelUnlocked(profile: Profile, levelId: string): boolean {
  const i = LEVELS.findIndex((l) => l.id === levelId);
  if (i <= 0) return i === 0;
  const prev = profile.levels[LEVELS[i - 1].id];
  return !!prev && prev.bestScore >= UNLOCK_SCORE;
}

export function totalPoints(profile: Profile): number {
  return Object.values(profile.levels).reduce((a, l) => a + l.bestScore, 0);
}

export function totalStars(profile: Profile): number {
  return Object.values(profile.levels).reduce((a, l) => a + l.bestStars, 0);
}

export function applyLevelResult(profile: Profile, levelId: string, result: LevelResult, nowMs: number): Profile {
  return { ...profile, levels: { ...profile.levels, [levelId]: mergeBest(profile.levels[levelId], result, nowMs) } };
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
