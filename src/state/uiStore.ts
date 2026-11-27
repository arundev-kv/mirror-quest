import { create } from 'zustand';
import type { LevelResult } from '../core/scoring';
import type { LevelProgress } from '../core/types';

export type Screen =
  | { name: 'profiles' }
  | { name: 'create' }
  | { name: 'map' }
  | { name: 'level'; levelId: string; startedAtUsedMs: number }
  | { name: 'results'; levelId: string; result: LevelResult; previous?: LevelProgress }
  | { name: 'parentGate' }
  | { name: 'parent' };

interface UiState {
  screen: Screen;
  /** Increments on every navigation; used as a React key so a retry starts fresh. */
  navId: number;
  go: (s: Screen) => void;
  /** A stretch break is due and will be shown at the next calm moment. */
  breakDue: boolean;
  setBreakDue: (v: boolean) => void;
}

export const useUi = create<UiState>()((set) => ({
  screen: { name: 'profiles' },
  navId: 0,
  go: (screen) => set((st) => ({ screen, navId: st.navId + 1 })),
  breakDue: false,
  setBreakDue: (breakDue) => set({ breakDue }),
}));
