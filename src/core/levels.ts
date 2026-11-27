import type { Transform } from './geometry';
import { AMBIGUOUS_MIRROR, DIAGONAL_GLYPHS, getGlyph, MOTOR_FAMILY } from './glyphs';
import { createRng, pick, shuffle, type Rng } from './random';
import { isSymmetricUnder } from './recognizer';
import {
  CREATURES,
  isScored,
  roundKey,
  type BodyMove,
  type PickOption,
  type Round,
  type RoundKind,
  type SequenceChar,
} from './rounds';
import type { ThemeId } from './themes';
import type { Age } from './types';

export * from './rounds';
export * from './themes';

/**
 * Data-driven level content. A level is a theme plus a recipe of round kinds;
 * rounds are generated from the recipe with a seeded RNG. Adding a level means
 * adding a LevelConfig entry, not writing a component.
 * The clinical reasoning for every level is in docs/LEVEL_PLAN.md.
 */

export type PickStyle =
  /** The same glyph several ways round; tap the right way. */
  | 'orientation'
  /** Two look-alike letters (b/d, p/q), both the right way round; tap the one that was said. */
  | 'family'
  /** Match a capital to its small letter (S to s): capital right way vs flipped. */
  | 'case';

export interface RoundRecipe {
  kind: RoundKind;
  /** How many rounds of this kind (ages 3-4). */
  count: number;
  /** Extra rounds for ages 5-6. */
  extraForOlder?: number;
  glyphs?: string[];
  /** side / facing: show the coloured hand hint. */
  hint?: boolean;
  view?: 'front' | 'back' | 'mixed';
  /** body */
  moves?: BodyMove[];
  /** direction: "where is it going?" or "same way?" */
  mode?: 'where' | 'same';
  /** path */
  axis?: 'horizontal' | 'vertical' | 'mixed';
  /** pick */
  pickStyle?: PickStyle;
  /** pick (family): show the motor cue (stick / c). */
  cue?: boolean;
  /** write */
  guideOpacity?: number;
  showStart?: boolean;
  /** write from memory: the model shows for 2 s, then hides. */
  memory?: boolean;
  requireStart?: boolean;
  /** sequence: words ("bed") or numbers ("12"). */
  items?: string[];
}

export interface LevelConfig {
  id: string;
  number: number;
  /** World 1-6; one theme per world. */
  world: number;
  theme: ThemeId;
  /** Parent-facing description of the skill. */
  skill: string;
  /** Icon shown on the level stone. */
  icon: string;
  /** Short title shown on the map and the intro card. */
  title: string;
  /** One or two plain sentences a grown-up (or an early reader) can read out before playing. */
  intro: string;
  /** Share of scored rounds right first time (and, for writing, from the right start) that counts as mastered. */
  mastery: number;
  /** Hard age lock (only level 29). Other ages are advice: the game adapts instead. */
  minAge?: Age;
  /** Levels that must be mastered (on two different days) before this one opens. */
  requiresMastery?: string[];
  /** Mixed reviews interleave their rounds (warm-ups stay first). */
  interleave?: boolean;
  /** The grand review adds the child's most reversed characters to its pools. */
  personalised?: boolean;
  recipe: RoundRecipe[];
}

export const WORLDS: { number: number; theme: ThemeId; name: string }[] = [
  { number: 1, theme: 'meadow', name: 'Meadow' },
  { number: 2, theme: 'lake', name: 'Lake' },
  { number: 3, theme: 'forest', name: 'Forest' },
  { number: 4, theme: 'village', name: 'Village' },
  { number: 5, theme: 'hut', name: 'Mountain hut' },
  { number: 6, theme: 'castle', name: 'Castle' },
];

const SIDE_ITEMS = ['🍎', '🌼', '🐞', '🍄', '🦋', '🐣', '🍓', '🐌', '🌰', '🐝'];
const PATH_ITEMS = ['🌼', '🍄', '🐞', '🌰', '🍓', '🦋', '🐝', '🍎'];

/** Sequence material: word -> picture. Every letter is one the child has met by world 6. */
export const SEQUENCE_WORDS: Record<string, string> = { bed: '🛏️', dog: '🐶', pig: '🐷', bud: '🌱' };

const L = (
  n: number,
  world: number,
  rest: Omit<LevelConfig, 'id' | 'number' | 'world' | 'theme'> & { theme?: ThemeId },
): LevelConfig => ({
  id: `L${String(n).padStart(2, '0')}`,
  number: n,
  world,
  theme: rest.theme ?? WORLDS[world - 1].theme,
  ...rest,
});

const trace = (glyphs: string[], count: number, extra = 1, more: Partial<RoundRecipe> = {}): RoundRecipe => ({
  kind: 'write',
  count,
  extraForOlder: extra,
  glyphs,
  guideOpacity: 0.6,
  showStart: true,
  ...more,
});
const write = (glyphs: string[], guideOpacity: number, count: number, extra = 1): RoundRecipe => ({
  kind: 'write',
  count,
  extraForOlder: extra,
  glyphs,
  guideOpacity,
  showStart: true,
});
const memory = (glyphs: string[], count: number, extra = 0): RoundRecipe => ({
  kind: 'write',
  count,
  extraForOlder: extra,
  glyphs,
  guideOpacity: 0,
  showStart: false,
  memory: true,
});
const judge = (glyphs: string[], count: number, extra = 0): RoundRecipe => ({
  kind: 'judge',
  count,
  extraForOlder: extra,
  glyphs,
});
const body = (moves: BodyMove[], glyphs?: string[], count = 1): RoundRecipe => ({ kind: 'body', count, moves, glyphs });

export const LEVELS: LevelConfig[] = [
  // ---------- World 1: Meadow, my body and which way things go ----------
  L(1, 1, {
    skill: 'Left and right on my own body (green = left, blue = right)',
    icon: '🖐️',
    title: 'Left and right on me',
    intro:
      'LEFT is green and RIGHT is blue. Grown-ups: a green sticker on the left hand helps. Wave the hand, then tap the picture on that side.',
    mastery: 0.8,
    recipe: [
      body(['wave', 'stamp'], undefined, 2),
      { kind: 'side', count: 4, extraForOlder: 1, hint: true },
      { kind: 'side', count: 4, extraForOlder: 1, hint: false },
    ],
  }),
  L(2, 1, {
    skill: 'Seeing that a mirror image points the other way (pictures before letters)',
    icon: '🐐',
    title: 'Which way is it going?',
    intro: 'Animals look the way they are going. Tap the side the goat is heading to. Then: are the two the same way?',
    mastery: 0.8,
    recipe: [
      { kind: 'direction', count: 4, extraForOlder: 1, mode: 'where' },
      { kind: 'direction', count: 4, extraForOlder: 1, mode: 'same' },
    ],
  }),
  L(3, 1, {
    skill: 'The direction of writing: left to right, top to bottom',
    icon: '➡️',
    title: 'Start on the left, start at the top',
    intro: 'We always start on the LEFT and at the TOP. Start each line at the green dot and follow the arrow.',
    mastery: 0.8,
    recipe: [
      body(['skyline']),
      trace(['hline'], 2, 1, { requireStart: true }),
      trace(['vline'], 2, 1, { requireStart: true }),
      { kind: 'path', count: 4, axis: 'mixed' },
    ],
  }),
  L(4, 1, {
    skill: 'The anticlockwise "magic c" turn that builds c, o, a, d, g, q, e, 9 and 6',
    icon: '🌀',
    title: 'The magic c turn',
    intro: 'Make a big c in the air with a straight arm. Start at the green dot, near the top, and go round the c way.',
    mastery: 0.8,
    recipe: [
      body(['armcircle']),
      trace(['circle', 'c'], 4, 1, { requireStart: true }),
      trace(['circle', 'c'], 4, 1, { requireStart: true, guideOpacity: 0.4 }),
    ],
  }),
  L(5, 1, {
    skill: 'Review: body sides, facing, stroke direction and the c turn, mixed',
    icon: '🌻',
    title: 'Meadow review',
    intro: 'A bit of everything from the meadow, all mixed up. Look carefully each time!',
    mastery: 0.8,
    interleave: true,
    recipe: [
      { kind: 'side', count: 2, extraForOlder: 1, hint: false },
      { kind: 'direction', count: 2, mode: 'where' },
      { kind: 'direction', count: 2, mode: 'same' },
      { ...write(['hline', 'vline'], 0.4, 2, 0), requireStart: true },
      { ...write(['circle', 'c'], 0.4, 2, 1), requireStart: true },
    ],
  }),

  // ---------- World 2: Alpine lake, the stick family ----------
  L(6, 2, {
    skill: 'Straight-stick letters l and t: letters start at the top',
    icon: '🪵',
    title: 'l and t',
    intro: 'l is one tall stick, from the top down. t is a stick with a cross. Start at the green dot.',
    mastery: 0.8,
    recipe: [
      body(['skywrite'], ['l']),
      trace(['l', 't'], 3),
      write(['l', 't'], 0.3, 3),
      { kind: 'pick', count: 2, glyphs: ['t'], pickStyle: 'orientation' },
    ],
  }),
  L(7, 2, {
    skill: 'b on its own: stick, then bump (trace, write, then spot a backwards b)',
    icon: '⚾',
    title: 'b: stick, then bump',
    intro: 'b starts with a tall stick. Go down, back up, then round the bump, like a bat and then a ball.',
    mastery: 0.8,
    recipe: [body(['skywrite'], ['b']), trace(['b'], 3), write(['b'], 0.25, 3), judge(['b'], 2)],
  }),
  L(8, 2, {
    skill: 'h, n and r: stick, then back up and over (the same path as b)',
    icon: '🏠',
    title: 'h, n and r',
    intro: 'h, n and r start with a stick. Go down, back up, and over the hill.',
    mastery: 0.8,
    recipe: [
      trace(['h', 'n', 'r'], 3),
      write(['h', 'n', 'r'], 0.3, 3),
      { kind: 'pick', count: 2, glyphs: ['h', 'n', 'r'], pickStyle: 'orientation' },
    ],
  }),
  L(9, 2, {
    skill: 'p on its own: b’s family, but the stick goes down low',
    icon: '🐷',
    title: 'p: stick down low',
    intro: 'p is like b, but the stick goes down low, under the line. Stick first, then the bump.',
    mastery: 0.8,
    recipe: [body(['skywrite'], ['p']), trace(['p'], 3), write(['p'], 0.3, 3), judge(['p'], 2)],
  }),
  L(10, 2, {
    skill: 'Review of the stick family, with the first writing from memory',
    icon: '⛵',
    title: 'Lake review',
    intro: 'Stick letters, all mixed. Sometimes the letter hides: look, remember, then write it.',
    mastery: 0.8,
    interleave: true,
    recipe: [
      write(['l', 't', 'b', 'h', 'n', 'r', 'p'], 0.3, 4),
      memory(['b', 'p', 't'], 2),
      judge(['b', 'p', 't', 'h'], 4, 1),
    ],
  }),

  // ---------- World 3: Pine forest, the c family ----------
  L(11, 3, {
    skill: 'c, o and e from the magic c (start at 2 o’clock, turn the c way)',
    icon: '🥚',
    title: 'c, o and e',
    intro: 'c starts near the top and goes round the c way. o closes the circle. e is a line across, then a c.',
    mastery: 0.8,
    recipe: [body(['armcircle']), trace(['c', 'o', 'e'], 3), write(['c', 'o', 'e'], 0.3, 3), judge(['c', 'e'], 2)],
  }),
  L(12, 3, {
    skill: 'a: c, then a short stick (the safe rehearsal for d)',
    icon: '🍎',
    title: 'a: c, then a short stick',
    intro: 'a starts with a magic c. Then a short stick, down.',
    mastery: 0.8,
    recipe: [trace(['a'], 3), write(['a'], 0.3, 3), judge(['a'], 2)],
  }),
  L(13, 3, {
    skill: 'd on its own: c, then a TALL stick (never shown next to b)',
    icon: '🐶',
    title: 'd: c, then a tall stick',
    intro: 'd starts with a magic c, like a. Then the stick goes up TALL, and back down.',
    mastery: 0.8,
    recipe: [
      body(['skywrite'], ['d']),
      trace(['d'], 3),
      write(['d'], 0.3, 3),
      write(['d'], 0.15, 2, 0),
      judge(['d'], 2),
    ],
  }),
  L(14, 3, {
    skill: 'g and q: c, then a stick that goes down low',
    icon: '👑',
    title: 'g and q',
    intro: 'g and q start with a magic c. Then the stick goes down low, under the line.',
    mastery: 0.8,
    recipe: [trace(['g', 'q'], 3), write(['g', 'q'], 0.3, 3), judge(['g', 'q'], 2)],
  }),
  L(15, 3, {
    skill: 'Review of the c family, with d and q written from memory',
    icon: '🌲',
    title: 'Forest review',
    intro: 'Magic c letters, all mixed. When a letter hides, remember it and write it.',
    mastery: 0.8,
    interleave: true,
    recipe: [
      write(['c', 'o', 'e', 'a', 'd', 'g', 'q'], 0.3, 4),
      memory(['d', 'q'], 2),
      judge(['a', 'd', 'e', 'g', 'q'], 4, 1),
    ],
  }),

  // ---------- World 4: Village, numbers ----------
  L(16, 4, {
    skill: '1 and 7: start at the top and go right first',
    icon: '🪃',
    title: '1 and 7',
    intro: '1 is a little hat, then a stick down. 7 goes across first, then slides down.',
    mastery: 0.8,
    recipe: [body(['skywrite'], ['7']), trace(['1', '7'], 3), write(['1', '7'], 0.3, 3), judge(['1', '7'], 2)],
  }),
  L(17, 4, {
    skill: '2 and 3 share their first curve: up and over to the right',
    icon: '🦢',
    title: '2 and 3',
    intro: '2 and 3 both start the same way: up and over to the right.',
    mastery: 0.8,
    recipe: [trace(['2', '3'], 3), write(['2', '3'], 0.3, 3), judge(['2', '3'], 2)],
  }),
  L(18, 4, {
    skill: '4 and 5 (right-facing, a success level between two hard pairs)',
    icon: '🖐',
    title: '4 and 5',
    intro: '4 goes down, across, then cuts through. 5 goes down, round the belly, and the hat goes on last.',
    mastery: 0.8,
    recipe: [trace(['4', '5'], 3), write(['4', '5'], 0.3, 3), judge(['4', '5'], 2)],
  }),
  L(19, 4, {
    skill: '9 (magic c, then a stick) and then 6 (slide down and curl), never contrasted',
    icon: '🎈',
    title: '9, then 6',
    intro: '9 starts with a magic c, then a stick down. 6 slides down and curls round.',
    mastery: 0.8,
    recipe: [
      trace(['9'], 2, 0),
      write(['9'], 0.3, 1),
      judge(['9'], 1),
      trace(['6'], 2, 0),
      write(['6'], 0.3, 1),
      judge(['6'], 1),
    ],
  }),
  L(20, 4, {
    skill: 'Review of digits 1-9, with 2, 3, 7 and 9 written from memory',
    icon: '🏘️',
    title: 'Village review',
    intro: 'All the numbers, mixed. When a number hides, remember it and write it.',
    mastery: 0.8,
    interleave: true,
    recipe: [
      write(['0', '1', '4', '5', '8'], 0.3, 3),
      memory(['2', '3', '7', '9'], 3, 1),
      judge(['2', '3', '7', '9', '5'], 4),
    ],
  }),

  // ---------- World 5: Mountain hut, telling look-alikes apart ----------
  L(21, 5, {
    skill: 'Telling b from d with the motor cue each was taught with (stick first / c first)',
    icon: '🤔',
    title: 'b or d?',
    intro:
      'b starts with a stick. d starts with a c. Listen, then tap the letter. Grown-ups: this world opens once b, p, d, g and q are learned on two different days.',
    mastery: 0.85,
    requiresMastery: ['L07', 'L09', 'L13', 'L14'],
    recipe: [
      body(['skywrite'], ['b', 'd']),
      { kind: 'pick', count: 5, extraForOlder: 1, glyphs: ['b', 'd'], pickStyle: 'family', cue: true },
      { kind: 'pick', count: 5, extraForOlder: 1, glyphs: ['b', 'd'], pickStyle: 'family', cue: false },
    ],
  }),
  L(22, 5, {
    skill: 'Judging and correcting b, d, p and q (self-checking)',
    icon: '🪞',
    title: 'Right way or flipped?',
    intro: 'Is the letter the right way round? Tap the tick if it is. If it is flipped, tap flip to fix it.',
    mastery: 0.85,
    recipe: [judge(['b', 'd', 'p', 'q'], 10, 2)],
  }),
  L(23, 5, {
    skill: 'Telling p from q (stick first / c first)',
    icon: '🔍',
    title: 'p or q?',
    intro: 'p starts with a stick. q starts with a c. Listen, then tap the letter.',
    mastery: 0.85,
    recipe: [
      { kind: 'pick', count: 5, extraForOlder: 1, glyphs: ['p', 'q'], pickStyle: 'family', cue: true },
      { kind: 'pick', count: 5, extraForOlder: 1, glyphs: ['p', 'q'], pickStyle: 'family', cue: false },
    ],
  }),
  L(24, 5, {
    skill: 'Writing b, d, p and q from memory (the best predictor of paper handwriting)',
    icon: '🧠',
    title: 'b, d, p and q from memory',
    intro: 'Look at the letter. It will hide. Then write it from memory, starting in the right place.',
    mastery: 0.8,
    interleave: true,
    recipe: [memory(['b', 'd', 'p', 'q'], 8, 2)],
  }),
  L(25, 5, {
    skill: 'Review: b, d, p, q with the left-facing digits and c-family letters',
    icon: '🏔️',
    title: 'Hut review',
    intro: 'Letters and numbers, all mixed. Take your time and look carefully.',
    mastery: 0.85,
    interleave: true,
    recipe: [
      judge(['b', 'd', 'p', 'q', '2', '3', '7', '9'], 3, 1),
      { kind: 'pick', count: 3, extraForOlder: 1, glyphs: ['b', 'd', 'p', 'q'], pickStyle: 'family', cue: false },
      memory(['b', 'd', 'p', 'q', '2', '3', '7', '9', 'a', 'g'], 4),
    ],
  }),

  // ---------- World 6: Castle, using it ----------
  L(26, 6, {
    skill: 's, z and j: the remaining often-reversed small letters',
    icon: '🐍',
    title: 'Tricky letters: s, z and j',
    intro:
      's starts like a c, then swings back. z goes across, slides down, and across again. j is a stick with a hook.',
    mastery: 0.8,
    recipe: [
      body(['skywrite'], ['s', 'z']),
      trace(['s', 'z', 'j'], 3),
      write(['s', 'z', 'j'], 0.3, 2, 0),
      memory(['s', 'z', 'j'], 2),
      judge(['s', 'z', 'j'], 3, 1),
    ],
  }),
  L(27, 6, {
    skill: 'S, Z, J and N: the capitals children reverse most (they are in names)',
    icon: '🏰',
    title: 'Tricky capitals: S, Z, J and N',
    intro: 'Big letters this time. Start at the green dot. Then find the big letter that matches the small one.',
    mastery: 0.8,
    recipe: [
      trace(['S', 'Z', 'J', 'N'], 2),
      write(['S', 'Z', 'J', 'N'], 0.3, 2, 0),
      judge(['S', 'Z', 'J', 'N'], 2, 1),
      { kind: 'pick', count: 2, glyphs: ['S', 'Z', 'J'], pickStyle: 'case' },
    ],
  }),
  L(28, 6, {
    skill: 'Whole words and numbers left to right (12 is not 21)',
    icon: '📖',
    title: 'Left to right: words and numbers',
    intro: 'Words and numbers go from left to right. Find the one that matches the picture or the beads.',
    mastery: 0.8,
    recipe: [
      { kind: 'sequence', count: 4, extraForOlder: 1, items: Object.keys(SEQUENCE_WORDS) },
      { kind: 'sequence', count: 4, extraForOlder: 1, items: ['12', '13', '15', '21', '31', '51'] },
    ],
  }),
  L(29, 6, {
    skill: 'Another person’s left and right: back view first, then facing me',
    icon: '🤝',
    title: 'A friend facing me',
    intro:
      'Stand back to back with a grown-up: your left is their left. When a friend turns to face you, their left is on your right side.',
    mastery: 0.8,
    minAge: 6,
    recipe: [
      body(['backtoback']),
      { kind: 'facing', count: 3, extraForOlder: 1, view: 'back', hint: true },
      { kind: 'facing', count: 5, extraForOlder: 1, view: 'front', hint: false },
    ],
  }),
  L(30, 6, {
    skill: 'Everything, mixed, weighted towards the characters this child reverses most',
    icon: '🌄',
    title: 'Grand review',
    intro: 'A big review of everything you learned. Take your time.',
    mastery: 0.85,
    interleave: true,
    personalised: true,
    recipe: [
      { kind: 'side', count: 1, hint: false },
      { kind: 'direction', count: 1, mode: 'same' },
      judge(['d', 'q', 'j', 'z', '2', '3', '7', '9', 'b', 'p'], 4),
      memory(['b', 'd', 'p', 'q', '2', '3', '7', '9', 's', 'z', 'j'], 4),
      { kind: 'pick', count: 2, glyphs: ['b', 'd', 'p', 'q'], pickStyle: 'family', cue: false },
    ],
  }),
];

export function getLevel(id: string): LevelConfig | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function nextLevel(id: string): LevelConfig | undefined {
  const i = LEVELS.findIndex((l) => l.id === id);
  return i >= 0 ? LEVELS[i + 1] : undefined;
}

/** Hard age lock (level 29 is age 6 only). */
export function isPlayableAtAge(level: LevelConfig, age: Age): boolean {
  return !level.minAge || age >= level.minAge;
}

const countFor = (r: RoundRecipe, age: Age) => r.count + (age >= 5 ? (r.extraForOlder ?? 0) : 0);

/** Scored rounds only: body warm-ups don't count towards the 8-12. */
export function roundCount(level: LevelConfig, age: Age): number {
  return level.recipe.reduce((a, r) => a + (r.kind === 'body' ? 0 : countFor(r, age)), 0);
}

// ---------- age adapters ----------

/** Errorless learning: the faintest guide a child of this age gets. Age 3 only traces. */
export function guideFloor(age: Age, glyphId: string): number {
  if (age <= 3) return 0.6;
  if (DIAGONAL_GLYPHS.has(glyphId) && age <= 4) return 0.6; // diagonals are a 5-year shape
  if (age === 4) return 0.3;
  return 0;
}

const MEMORY_MODEL_MS = 2000;
const LOOKALIKE: Record<string, string> = { b: 'd', d: 'b', p: 'q', q: 'p' };

function twoItems(rng: Rng): [string, string] {
  const [a, b] = shuffle(rng, SIDE_ITEMS);
  return [a, b];
}
const side = (rng: Rng) => pick(rng, ['left', 'right'] as const);

/** Distractor transforms that really look different from the glyph. */
function distractors(glyphId: string, rng: Rng, n: number): Transform[] {
  const gl = getGlyph(glyphId);
  // b/d/p/q mirror into other real letters, so only the mirror is offered (never a "flipped" look-alike pair).
  const pool: Transform[] = AMBIGUOUS_MIRROR.has(glyphId) ? ['flipX'] : ['flipX', 'flipY', 'rotate180'];
  const real = pool.filter((t) => !isSymmetricUnder(gl, t));
  // Mirror first: it is the reversal we are training against.
  const ordered = real.includes('flipX')
    ? [
        'flipX' as Transform,
        ...shuffle(
          rng,
          real.filter((t) => t !== 'flipX'),
        ),
      ]
    : real;
  return ordered.slice(0, n);
}

function sequenceChars(text: string, mode: 'right' | 'mirror' | 'order'): SequenceChar[] {
  const chars = [...text];
  if (mode === 'right') return chars.map((c) => ({ glyphId: c, transform: 'identity' }));
  if (mode === 'order') return chars.reverse().map((c) => ({ glyphId: c, transform: 'identity' }));
  // Mirror writing: the whole thing flipped, so the order AND every character reverse.
  return chars.reverse().map((c) => ({ glyphId: c, transform: 'flipX' }));
}

export function buildRound(recipe: RoundRecipe, rng: Rng, age: Age, pool?: string[]): Round {
  const glyphs = pool ?? recipe.glyphs ?? ['b'];
  const glyphId = pick(rng, glyphs);
  switch (recipe.kind) {
    case 'body': {
      const move = pick<BodyMove>(rng, recipe.moves ?? ['wave']);
      if (move === 'wave' || move === 'stamp') return { kind: 'body', move, side: side(rng) };
      if (move === 'skywrite') return { kind: 'body', move, glyphId };
      return { kind: 'body', move };
    }
    case 'side':
      // Age 3 keeps the colour hint all the way through.
      return { kind: 'side', target: side(rng), items: twoItems(rng), hint: (recipe.hint ?? false) || age <= 3 };
    case 'facing': {
      const view = recipe.view === 'mixed' || !recipe.view ? pick(rng, ['front', 'back'] as const) : recipe.view;
      return { kind: 'facing', target: side(rng), view, items: twoItems(rng), hint: recipe.hint ?? false };
    }
    case 'direction': {
      const creature = pick(rng, CREATURES);
      const facing = side(rng);
      if (recipe.mode === 'same') return { kind: 'direction', creature, facing, compareTo: side(rng) };
      return { kind: 'direction', creature, facing };
    }
    case 'path': {
      const axis =
        recipe.axis === 'mixed' || !recipe.axis ? pick(rng, ['horizontal', 'vertical'] as const) : recipe.axis;
      return { kind: 'path', axis, items: shuffle(rng, PATH_ITEMS).slice(0, age >= 5 ? 4 : 3) };
    }
    case 'pick': {
      const style = recipe.pickStyle ?? 'orientation';
      if (style === 'family') {
        const options: PickOption[] = [glyphId, LOOKALIKE[glyphId] ?? glyphId].map((g) => ({
          glyphId: g,
          transform: 'identity',
          correct: g === glyphId,
        }));
        return {
          kind: 'pick',
          target: glyphId,
          options: shuffle(rng, options),
          cue: recipe.cue ? MOTOR_FAMILY[glyphId] : undefined,
        };
      }
      const n = style === 'case' || age <= 4 ? 1 : 2;
      const options: PickOption[] = [
        { glyphId, transform: 'identity', correct: true },
        ...distractors(glyphId, rng, n).map((t) => ({ glyphId, transform: t, correct: false })),
      ];
      return {
        kind: 'pick',
        target: glyphId,
        options: shuffle(rng, options),
        refGlyph: style === 'case' ? glyphId.toLowerCase() : undefined,
      };
    }
    case 'judge':
      return { kind: 'judge', glyphId, shown: rng() < 0.5 ? 'identity' : 'flipX' };
    case 'write': {
      const floor = guideFloor(age, glyphId);
      const memoryOk = recipe.memory && age >= 4;
      const guideOpacity = Math.max(recipe.memory && !memoryOk ? 0.6 : (recipe.guideOpacity ?? 0.4), floor);
      return {
        kind: 'write',
        glyphId,
        guideOpacity,
        showStart: recipe.memory ? !memoryOk || floor > 0 : (recipe.showStart ?? true),
        modelMs: memoryOk ? MEMORY_MODEL_MS : undefined,
        requireStart: recipe.requireStart,
      };
    }
    case 'sequence': {
      const text = pick(rng, recipe.items ?? ['bed']);
      const isWord = text in SEQUENCE_WORDS;
      // Words: letters in reverse order (bed / deb), and at 6 also the whole word mirror-written. Numbers: 12 vs 21.
      const modes: ('mirror' | 'order')[] = isWord && age >= 6 ? ['order', 'mirror'] : ['order'];
      return {
        kind: 'sequence',
        text,
        clue: isWord ? SEQUENCE_WORDS[text] : text,
        clueType: isWord ? 'picture' : 'beads',
        options: shuffle(rng, [
          { chars: sequenceChars(text, 'right'), correct: true },
          ...modes.map((m) => ({ chars: sequenceChars(text, m), correct: false })),
        ]),
      };
    }
  }
}

/**
 * Generate the rounds for one attempt. Recipe order is kept (easier kinds first) except in
 * reviews, which interleave. Warm-ups always come first. `focus` (most reversed characters)
 * is added twice to the glyph pools of a personalised review.
 */
export function generateRounds(level: LevelConfig, age: Age, seed: number, focus: string[] = []): Round[] {
  const rng = createRng(seed);
  const warmups: Round[] = [];
  let rounds: Round[] = [];
  for (const recipe of level.recipe) {
    const n = countFor(recipe, age);
    let pool = recipe.glyphs;
    if (level.personalised && pool && (recipe.kind === 'judge' || recipe.kind === 'write')) {
      const extra = focus.filter((g) => pool!.includes(g));
      pool = [...pool, ...extra, ...extra];
    }
    let prevKey = '';
    for (let i = 0; i < n; i++) {
      let r = buildRound(recipe, rng, age, pool);
      for (let tries = 0; tries < 4 && roundKey(r) === prevKey; tries++) r = buildRound(recipe, rng, age, pool);
      prevKey = roundKey(r);
      (isScored(r) ? rounds : warmups).push(r);
    }
  }
  if (level.interleave) rounds = interleave(rounds, rng);
  return [...warmups, ...rounds];
}

/** Shuffle, then nudge apart identical neighbours. */
function interleave(rounds: Round[], rng: Rng): Round[] {
  const out = shuffle(rng, rounds);
  for (let i = 1; i < out.length; i++) {
    if (roundKey(out[i]) !== roundKey(out[i - 1])) continue;
    const j = out.findIndex((r, k) => k > i && roundKey(r) !== roundKey(out[i - 1]));
    if (j > 0) [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
