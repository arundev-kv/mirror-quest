/** Shared domain types. Pure TS: no React, DOM or browser APIs in /src/core. */

export type Age = 3 | 4 | 5 | 6;
export type Stars = 0 | 1 | 2 | 3;
export type Side = 'left' | 'right';

export interface LevelProgress {
  bestScore: number;
  bestStars: Stars;
  attempts: number;
  /** Fastest completion of the best-scoring run. */
  bestTimeMs: number | null;
  lastPlayedAt: number;
}

export interface DailyUsage {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  /** Active play time today. */
  usedMs: number;
  /** Latest wall-clock time we have seen; guards against the clock being moved back. */
  lastWallMs: number;
}

export interface Profile {
  id: string;
  name: string;
  age: Age;
  avatarId: string;
  createdAt: number;
  levels: Record<string, LevelProgress>;
  /** How often each glyph (or "left"/"right") was reversed. Shown to parents. */
  reversals: Record<string, number>;
  usage: DailyUsage;
  /** Active minutes per local date, for the parent dashboard (kept for 30 days). */
  history: Record<string, number>;
}

export interface Settings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export interface AppData {
  schemaVersion: number;
  profiles: Profile[];
  settings: Settings;
}
