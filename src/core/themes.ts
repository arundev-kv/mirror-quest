/** Theme (world) palettes and music settings. One theme per world. */

export type ThemeId = 'meadow' | 'lake' | 'forest' | 'hut' | 'village' | 'castle';

export interface Theme {
  id: ThemeId;
  /** Parent-facing name; kids never need to read it. */
  name: string;
  sky: string;
  ground: string;
  accent: string;
  /** Root note (Hz) and tempo for the generative background music. */
  music: { root: number; bpm: number; scale: number[] };
}

/**
 * Bright, natural alpine palettes (think sunny mountain meadows): clear sky blue,
 * fresh grass green, wildflower yellow. Vivid but natural; no neon, no flashing.
 */
export const THEMES: Record<ThemeId, Theme> = {
  meadow: {
    id: 'meadow',
    name: 'Mountain meadow',
    sky: '#8ccbf0',
    ground: '#7cc46a',
    accent: '#4f9d4a',
    music: { root: 261.63, bpm: 72, scale: [0, 2, 4, 7, 9] },
  },
  lake: {
    id: 'lake',
    name: 'Alpine lake',
    sky: '#94d0f2',
    ground: '#6fbf63',
    accent: '#2f86c4',
    music: { root: 220.0, bpm: 66, scale: [0, 2, 5, 7, 9] },
  },
  forest: {
    id: 'forest',
    name: 'Pine forest',
    sky: '#a5d6f0',
    ground: '#69b05c',
    accent: '#3d7f3b',
    music: { root: 196.0, bpm: 66, scale: [0, 3, 5, 7, 10] },
  },
  hut: {
    id: 'hut',
    name: 'Mountain hut',
    sky: '#9bd0ef',
    ground: '#86c66f',
    accent: '#b5703d',
    music: { root: 233.08, bpm: 70, scale: [0, 2, 4, 7, 9] },
  },
  village: {
    id: 'village',
    name: 'Village',
    sky: '#a9d8f2',
    ground: '#8ccb72',
    accent: '#d9822b',
    music: { root: 293.66, bpm: 74, scale: [0, 2, 4, 7, 9] },
  },
  castle: {
    id: 'castle',
    name: 'Castle',
    sky: '#a2cff0',
    ground: '#7fbf68',
    accent: '#7a62b0',
    music: { root: 246.94, bpm: 68, scale: [0, 2, 5, 7, 9] },
  },
};
