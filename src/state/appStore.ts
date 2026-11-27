import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addReversal, applyLevelResult, createProfile, tickUsage } from '../core/profiles';
import type { LevelResult } from '../core/scoring';
import { DEFAULT_SETTINGS, mergeImported, migrate, SCHEMA_VERSION, STORAGE_KEY } from '../core/storage';
import { localDateKey } from '../core/time';
import type { Age, AppData, Profile, Settings } from '../core/types';

/**
 * The single persisted store. Everything is saved to localStorage under one key,
 * with a schema version and migrations from /src/core/storage.
 */

interface AppState extends AppData {
  activeProfileId: string | null;
  selectProfile: (id: string | null) => void;
  addProfile: (input: { name: string; age: Age; avatarId: string }) => Profile;
  deleteProfile: (id: string) => void;
  importProfiles: (profiles: Profile[]) => void;
  updateSettings: (s: Partial<Settings>) => void;
  recordResult: (levelId: string, result: LevelResult) => void;
  recordReversal: (key: string) => void;
  /** Advance the play clock for the active profile. */
  tick: (nowMs: number, activeMs: number) => void;
}

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const updateActive = (s: AppState, fn: (p: Profile) => Profile): Partial<AppState> => ({
  profiles: s.profiles.map((p) => (p.id === s.activeProfileId ? fn(p) : p)),
});

export const useApp = create<AppState>()(
  persist(
    (set) => ({
      schemaVersion: SCHEMA_VERSION,
      profiles: [],
      settings: { ...DEFAULT_SETTINGS },
      activeProfileId: null,

      selectProfile: (id) =>
        set((s) => ({
          activeProfileId: id,
          // Roll the daily budget over as soon as a profile is opened.
          profiles: id ? s.profiles.map((p) => (p.id === id ? tickUsage(p, Date.now(), 0) : p)) : s.profiles,
        })),
      addProfile: (input) => {
        const p = createProfile(input, Date.now(), newId());
        set((s) => ({ profiles: [...s.profiles, p] }));
        return p;
      },
      deleteProfile: (id) =>
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          activeProfileId: s.activeProfileId === id ? null : s.activeProfileId,
        })),
      importProfiles: (profiles) => set((s) => ({ profiles: mergeImported(s.profiles, profiles) })),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      recordResult: (levelId, result) =>
        set((s) => updateActive(s, (p) => applyLevelResult(p, levelId, result, Date.now()))),
      recordReversal: (key) => set((s) => updateActive(s, (p) => addReversal(p, key))),
      tick: (nowMs, activeMs) =>
        set((s) => {
          const p = s.profiles.find((x) => x.id === s.activeProfileId);
          // Nothing to save when idle on the same day: avoid rewriting localStorage every second.
          if (!p || (activeMs === 0 && p.usage.date === localDateKey(nowMs))) return {};
          return updateActive(s, (q) => tickUsage(q, nowMs, activeMs));
        }),
    }),
    {
      name: STORAGE_KEY,
      version: SCHEMA_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ schemaVersion: s.schemaVersion, profiles: s.profiles, settings: s.settings }),
      migrate: (persisted, version) => migrate(persisted, version),
      merge: (persisted, current) => ({ ...current, ...migrate(persisted, SCHEMA_VERSION) }),
    },
  ),
);

export function useActiveProfile(): Profile | null {
  return useApp((s) => s.profiles.find((p) => p.id === s.activeProfileId) ?? null);
}
