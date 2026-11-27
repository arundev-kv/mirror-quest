import type { Transform } from './geometry';
import { AMBIGUOUS_MIRROR } from './glyphs';
import { createRng, pick, shuffle, type Rng } from './random';
import type { Age, Side } from './types';

/**
 * Data-driven level content. A level is a theme plus a recipe of round kinds;
 * rounds are generated from the recipe with a seeded RNG. Adding a level means
 * adding a LevelConfig entry, not writing a component.
 */

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

/**
 * Clinical notes (see docs/LEVEL_PLAN.md):
 * - Stage 1 uses the child's OWN body only. Another person's left/right (a friend facing you)
 *   develops around age 7-8, so it comes in a late stage.
 * - b is taught alone, as a stick-family letter ("stick, then bump"). d is taught later from c.
 *   They are only contrasted once both are learned, to avoid the classic b/d interference.
 * - Support fades within a stage (errorless learning): hint/guide first, then less.
 */
export const LEVELS: LevelConfig[] = [
  {
    id: 'L01',
    number: 1,
    theme: 'meadow',
    skill: 'Left and right on my own body (the left hand makes an L)',
    icon: '🖐️',
    title: 'Left and Right',
    intro:
      'Hold up both hands with your thumbs out. Your LEFT hand makes an L! When you see a hand, tap the picture on that side.',
    recipe: [
      { kind: 'side', count: 4, extraForOlder: 1, hint: true },
      { kind: 'side', count: 4, extraForOlder: 1, hint: false },
    ],
  },
  {
    id: 'L02',
    number: 2,
    theme: 'lake',
    skill: 'b on its own: stick, then bump (trace, write, then spot a backwards b)',
    icon: '⚾',
    title: 'b',
    intro:
      'b starts with a tall stick. Go down, back up, then round the bump, like a bat and then a ball. Start at the green dot!',
    recipe: [
      { kind: 'write', count: 3, extraForOlder: 1, glyphs: ['b'], guideOpacity: 0.6, showStart: true },
      { kind: 'write', count: 3, extraForOlder: 1, glyphs: ['b'], guideOpacity: 0.25, showStart: true },
      { kind: 'judge', count: 2, glyphs: ['b'] },
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
