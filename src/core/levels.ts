import type { Transform } from './geometry';
import { AMBIGUOUS_MIRROR } from './glyphs';
import { createRng, pick, shuffle, type Rng } from './random';
import type { Age, Side } from './types';

/**
 * Data-driven level content. A level is a theme plus a recipe of round kinds;
 * rounds are generated from the recipe with a seeded RNG. Adding a level means
 * adding a LevelConfig entry, not writing a component.
 */

export type ThemeId = 'meadow' | 'ocean' | 'forest' | 'space' | 'garden' | 'castle';

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

/** Muted, low-saturation palettes. No neon, no saturated red. */
export const THEMES: Record<ThemeId, Theme> = {
  meadow: {
    id: 'meadow',
    name: 'Meadow',
    sky: '#cfe3e8',
    ground: '#b7cfa6',
    accent: '#7fa58a',
    music: { root: 261.63, bpm: 66, scale: [0, 2, 4, 7, 9] },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean',
    sky: '#d4e4ee',
    ground: '#a9c8d6',
    accent: '#6f97ad',
    music: { root: 220.0, bpm: 60, scale: [0, 2, 5, 7, 9] },
  },
  forest: {
    id: 'forest',
    name: 'Forest',
    sky: '#dfe6d8',
    ground: '#9fb592',
    accent: '#6d8c6a',
    music: { root: 196.0, bpm: 62, scale: [0, 3, 5, 7, 10] },
  },
  space: {
    id: 'space',
    name: 'Space',
    sky: '#3f4766',
    ground: '#5b6386',
    accent: '#b8b3d9',
    music: { root: 174.61, bpm: 56, scale: [0, 2, 4, 7, 11] },
  },
  garden: {
    id: 'garden',
    name: 'Garden',
    sky: '#ece4d6',
    ground: '#c9d3a9',
    accent: '#b39bc4',
    music: { root: 293.66, bpm: 68, scale: [0, 2, 4, 7, 9] },
  },
  castle: {
    id: 'castle',
    name: 'Castle',
    sky: '#e3dde8',
    ground: '#c2bccb',
    accent: '#8d86a8',
    music: { root: 246.94, bpm: 64, scale: [0, 2, 5, 7, 9] },
  },
};

// ---------- rounds ----------

export type Round =
  /** Tap the thing on MY left/right. */
  | { kind: 'side'; target: Side; items: [string, string]; hint: boolean }
  /** A friend faces me (front) or away (back); tap the friend's left/right hand. */
  | { kind: 'facing'; target: Side; view: 'front' | 'back'; items: [string, string]; hint: boolean }
  /** Pick the option that faces the right way. */
  | { kind: 'pick'; glyphId: string; options: Transform[]; showReference: boolean }
  /** Is this one facing the right way? Tap ✓ or flip it. */
  | { kind: 'judge'; glyphId: string; shown: Transform }
  /** Trace over the glyph (start dot + arrows), or write with a fading guide. */
  | { kind: 'write'; glyphId: string; guideOpacity: number; showStart: boolean };

export type RoundKind = Round['kind'];

/** Speed target per round kind, in ms. Generous: these are young children. */
export const SPEED_TARGET_MS: Record<RoundKind, number> = {
  side: 4_000,
  facing: 6_000,
  pick: 5_000,
  judge: 5_000,
  write: 14_000,
};

export interface RoundRecipe {
  kind: RoundKind;
  /** How many rounds of this kind (ages 3-4). */
  count: number;
  /** Extra rounds for ages 5-6. */
  extraForOlder?: number;
  glyphs?: string[];
  hint?: boolean;
  guideOpacity?: number;
  showStart?: boolean;
  view?: 'front' | 'back' | 'mixed';
  showReference?: boolean;
}

export interface LevelConfig {
  id: string;
  number: number;
  theme: ThemeId;
  /** Parent-facing description of the skill. */
  skill: string;
  /** Icon shown on the level stone. */
  icon: string;
  /** Short title shown on the map and the intro card. */
  title: string;
  /** One or two plain sentences a grown-up (or an early reader) can read out before playing. */
  intro: string;
  recipe: RoundRecipe[];
}

const SIDE_ITEMS = ['🍎', '🌼', '🐞', '🍄', '🦋', '🐣', '🍓', '🐌', '🌰', '🐝'];

export const LEVELS: LevelConfig[] = [
  {
    id: 'L01',
    number: 1,
    theme: 'meadow',
    skill: 'Left and right: my left and right, then a friend facing me',
    icon: '🖐️',
    title: 'Left and Right',
    intro:
      'Hold up both hands with your thumbs out. Your LEFT hand makes an L! Tap the picture on the side the big hand shows.',
    recipe: [
      { kind: 'side', count: 5, extraForOlder: 1, hint: true },
      { kind: 'facing', count: 3, extraForOlder: 1, view: 'front', hint: true },
    ],
  },
  {
    id: 'L02',
    number: 2,
    theme: 'ocean',
    skill: 'b and d: spot the right way round, then trace it',
    icon: '🐚',
    title: 'b and d',
    intro:
      'The letter b has its round tummy on the RIGHT, like the start of a bed 🛏️. Find the b and d that face the right way, then trace them.',
    recipe: [
      { kind: 'pick', count: 3, extraForOlder: 1, glyphs: ['b', 'd'], showReference: true },
      { kind: 'judge', count: 2, glyphs: ['b', 'd'] },
      { kind: 'write', count: 3, extraForOlder: 1, glyphs: ['b', 'd'], guideOpacity: 0.45, showStart: true },
    ],
  },
];

export function getLevel(id: string): LevelConfig | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function nextLevel(id: string): LevelConfig | undefined {
  const i = LEVELS.findIndex((l) => l.id === id);
  return i >= 0 ? LEVELS[i + 1] : undefined;
}

export function roundCount(level: LevelConfig, age: Age): number {
  return level.recipe.reduce((a, r) => a + r.count + (age >= 5 ? (r.extraForOlder ?? 0) : 0), 0);
}

/** Two different items for a left/right round. */
function twoItems(rng: Rng): [string, string] {
  const [a, b] = shuffle(rng, SIDE_ITEMS);
  return [a, b];
}

function buildRound(recipe: RoundRecipe, rng: Rng): Round {
  const glyphId = pick(rng, recipe.glyphs ?? ['b']);
  switch (recipe.kind) {
    case 'side':
      return {
        kind: 'side',
        target: pick(rng, ['left', 'right'] as const),
        items: twoItems(rng),
        hint: recipe.hint ?? false,
      };
    case 'facing': {
      const view = recipe.view === 'mixed' || !recipe.view ? pick(rng, ['front', 'back'] as const) : recipe.view;
      return {
        kind: 'facing',
        target: pick(rng, ['left', 'right'] as const),
        view,
        items: twoItems(rng),
        hint: recipe.hint ?? false,
      };
    }
    case 'pick': {
      // b/d/p/q mirror into real letters, so those always show the reference card.
      const showReference = recipe.showReference ?? AMBIGUOUS_MIRROR.has(glyphId);
      const distractors: Transform[] = AMBIGUOUS_MIRROR.has(glyphId)
        ? ['flipX']
        : shuffle(rng, ['flipX', 'flipY', 'rotate180'] as Transform[]).slice(0, 2);
      return {
        kind: 'pick',
        glyphId,
        options: shuffle(rng, ['identity', ...distractors] as Transform[]),
        showReference,
      };
    }
    case 'judge':
      return { kind: 'judge', glyphId, shown: rng() < 0.5 ? 'identity' : 'flipX' };
    case 'write':
      return { kind: 'write', glyphId, guideOpacity: recipe.guideOpacity ?? 0.4, showStart: recipe.showStart ?? true };
  }
}

/** Generate the rounds for one attempt. Recipe order is kept (easier kinds first). */
export function generateRounds(level: LevelConfig, age: Age, seed: number): Round[] {
  const rng = createRng(seed);
  const rounds: Round[] = [];
  for (const recipe of level.recipe) {
    const n = recipe.count + (age >= 5 ? (recipe.extraForOlder ?? 0) : 0);
    let prevKey = '';
    for (let i = 0; i < n; i++) {
      // Avoid the exact same round twice in a row.
      let r = buildRound(recipe, rng);
      for (let tries = 0; tries < 4 && roundKey(r) === prevKey; tries++) r = buildRound(recipe, rng);
      prevKey = roundKey(r);
      rounds.push(r);
    }
  }
  return rounds;
}

function roundKey(r: Round): string {
  switch (r.kind) {
    case 'side':
    case 'facing':
      return `${r.kind}:${r.target}`;
    case 'pick':
      return `${r.kind}:${r.glyphId}:${r.options.join()}`;
    case 'judge':
      return `${r.kind}:${r.glyphId}:${r.shown}`;
    case 'write':
      return `${r.kind}:${r.glyphId}`;
  }
}

/** The correct side of the SCREEN for a facing round. A friend facing me has their left on my right. */
export function screenSideForFacing(target: Side, view: 'front' | 'back'): Side {
  if (view === 'back') return target;
  return target === 'left' ? 'right' : 'left';
}
