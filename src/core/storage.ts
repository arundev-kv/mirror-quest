import { AVATAR_IDS } from './profiles';
import type { AppData, Profile, Settings } from './types';

/**
 * Versioned storage schema. Everything lives in browser localStorage under one key.
 * Bump SCHEMA_VERSION and add a step to MIGRATIONS whenever the shape changes.
 */

export const STORAGE_KEY = 'mirror-quest';
export const SCHEMA_VERSION = 1;

export const DEFAULT_SETTINGS: Settings = { musicVolume: 0.35, sfxVolume: 0.6, muted: false };

export function defaultData(): AppData {
  return { schemaVersion: SCHEMA_VERSION, profiles: [], settings: { ...DEFAULT_SETTINGS } };
}

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/** MIGRATIONS[n] upgrades data from version n to n + 1. */
const MIGRATIONS: Record<number, Migration> = {
  // Example for the future:
  // 1: (d) => ({ ...d, profiles: (d.profiles as Profile[]).map((p) => ({ ...p, newField: 0 })) }),
};

export function migrate(raw: unknown, fromVersion: number): AppData {
  if (!raw || typeof raw !== 'object') return defaultData();
  let data = raw as Record<string, unknown>;
  for (let v = fromVersion; v < SCHEMA_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (step) data = step(data);
  }
  return sanitize(data);
}

const clamp01 = (n: unknown, fallback: number) =>
  typeof n === 'number' && Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : fallback;

function sanitizeProfile(p: unknown): Profile | null {
  if (!p || typeof p !== 'object') return null;
  const q = p as Partial<Profile>;
  if (typeof q.id !== 'string' || typeof q.name !== 'string') return null;
  const age = q.age && [3, 4, 5, 6].includes(q.age) ? q.age : 5;
  const now = Date.now();
  return {
    id: q.id,
    name: q.name.slice(0, 16),
    age,
    avatarId:
      typeof q.avatarId === 'string' && (AVATAR_IDS as readonly string[]).includes(q.avatarId) ? q.avatarId : 'cat',
    createdAt: typeof q.createdAt === 'number' ? q.createdAt : now,
    levels: q.levels && typeof q.levels === 'object' ? q.levels : {},
    reversals: q.reversals && typeof q.reversals === 'object' ? q.reversals : {},
    usage:
      q.usage && typeof q.usage.date === 'string' && typeof q.usage.usedMs === 'number'
        ? { date: q.usage.date, usedMs: q.usage.usedMs, lastWallMs: q.usage.lastWallMs ?? now }
        : { date: '1970-01-01', usedMs: 0, lastWallMs: 0 },
    history: q.history && typeof q.history === 'object' ? q.history : {},
  };
}

function sanitize(data: Record<string, unknown>): AppData {
  const s = (data.settings ?? {}) as Partial<Settings>;
  const profiles = Array.isArray(data.profiles)
    ? data.profiles.map(sanitizeProfile).filter((p): p is Profile => p !== null)
    : [];
  return {
    schemaVersion: SCHEMA_VERSION,
    profiles,
    settings: {
      musicVolume: clamp01(s.musicVolume, DEFAULT_SETTINGS.musicVolume),
      sfxVolume: clamp01(s.sfxVolume, DEFAULT_SETTINGS.sfxVolume),
      muted: typeof s.muted === 'boolean' ? s.muted : false,
    },
  };
}

// ---------- export / import (parent dashboard) ----------

export interface ExportFile {
  app: 'mirror-quest';
  schemaVersion: number;
  exportedAt: number;
  profiles: Profile[];
}

export function serializeExport(profiles: Profile[], nowMs: number): string {
  const file: ExportFile = { app: 'mirror-quest', schemaVersion: SCHEMA_VERSION, exportedAt: nowMs, profiles };
  return JSON.stringify(file, null, 2);
}

/** Parse an exported file. Throws a readable error when the file isn't ours. */
export function parseImport(text: string): Profile[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('This file is not a Mirror Quest backup.');
  }
  const f = parsed as Partial<ExportFile>;
  if (f.app !== 'mirror-quest' || !Array.isArray(f.profiles))
    throw new Error('This file is not a Mirror Quest backup.');
  if (typeof f.schemaVersion === 'number' && f.schemaVersion > SCHEMA_VERSION) {
    throw new Error('This backup is from a newer version of the app.');
  }
  return migrate({ profiles: f.profiles }, f.schemaVersion ?? 1).profiles;
}

/** Imported profiles replace profiles with the same id and are added otherwise. */
export function mergeImported(existing: Profile[], imported: Profile[]): Profile[] {
  const byId = new Map(existing.map((p) => [p.id, p]));
  for (const p of imported) byId.set(p.id, p);
  return [...byId.values()];
}
