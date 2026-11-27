import type { Transform } from './geometry';
import type { Side } from './types';

/**
 * Round kinds. Each is a small, self-contained task with one correct answer
 * (except `body`, an unscored movement warm-up).
 */

/** Simple side-view pictures, drawn facing RIGHT and mirrored for LEFT. */
export type Creature = 'goat' | 'cow' | 'duck' | 'snail' | 'fish';
export const CREATURES: Creature[] = ['goat', 'cow', 'duck', 'snail', 'fish'];

export type BodyMove = 'wave' | 'stamp' | 'skyline' | 'armcircle' | 'skywrite' | 'backtoback';

export interface PickOption {
  glyphId: string;
  transform: Transform;
  correct: boolean;
}

export interface SequenceChar {
  glyphId: string;
  transform: Transform;
}

export interface SequenceOption {
  chars: SequenceChar[];
  correct: boolean;
}

/** The motor cue a look-alike letter was taught with: b and p start with a stick, d and q with a c. */
export type MotorCue = 'stick' | 'c';

export type Round =
  /** Unscored movement warm-up away from the screen, e.g. "Wave LEFT". */
  | { kind: 'body'; move: BodyMove; side?: Side; glyphId?: string }
  /** Tap the thing on MY left/right. */
  | { kind: 'side'; target: Side; items: [string, string]; hint: boolean }
  /** A friend faces me (front) or away (back); tap the friend's left/right hand. */
  | { kind: 'facing'; target: Side; view: 'front' | 'back'; items: [string, string]; hint: boolean }
  /** Which way is it going? With `compareTo`: do the two face the same way? */
  | { kind: 'direction'; creature: Creature; facing: Side; compareTo?: Side }
  /** Where do we start? Tap the left end of a row, or the top of a column. */
  | { kind: 'path'; axis: 'horizontal' | 'vertical'; items: string[] }
  /**
   * Pick one option. The target is spoken and shown as one word.
   * - `refGlyph`: a card shows a matching glyph (e.g. small s when picking capital S).
   * - `cue`: the motor cue the letter was taught with is shown (stick / c).
   */
  | { kind: 'pick'; target: string; options: PickOption[]; refGlyph?: string; cue?: MotorCue }
  /** Is this one facing the right way? Tap ✓ or flip it. */
  | { kind: 'judge'; glyphId: string; shown: Transform }
  /**
   * Trace / write. `modelMs`: memory writing, the model is shown for this long, then hidden.
   * `requireStart`: the start point and direction must be right to count (stroke levels).
   */
  | {
      kind: 'write';
      glyphId: string;
      guideOpacity: number;
      showStart: boolean;
      modelMs?: number;
      requireStart?: boolean;
    }
  /**
   * Pick the word or number written left to right with every character the right way.
   * `clue` is a picture (emoji) for words, or the number itself (shown as tens and ones beads).
   */
  | { kind: 'sequence'; text: string; clue: string; clueType: 'picture' | 'beads'; options: SequenceOption[] };

export type RoundKind = Round['kind'];
export type RoundOf<K extends RoundKind> = Extract<Round, { kind: K }>;

/** Rounds that count towards the score (body warm-ups don't). */
export const isScored = (r: Round) => r.kind !== 'body';

/** Handwriting is never timed: formation quality comes before speed. */
export const isTimed = (r: Round) => r.kind !== 'write' && r.kind !== 'body';

/** Speed target per round kind, in ms. Generous: these are young children. */
export const SPEED_TARGET_MS: Record<RoundKind, number> = {
  body: 30_000,
  side: 6_000,
  facing: 9_000,
  direction: 6_000,
  path: 6_000,
  pick: 7_500,
  judge: 7_500,
  write: 21_000,
  sequence: 9_000,
};

/** The correct side of the SCREEN for a facing round. A friend facing me has their left on my right. */
export function screenSideForFacing(target: Side, view: 'front' | 'back'): Side {
  if (view === 'back') return target;
  return target === 'left' ? 'right' : 'left';
}

/** A short key used to avoid the same round twice in a row. */
export function roundKey(r: Round): string {
  switch (r.kind) {
    case 'body':
      return `body:${r.move}:${r.side ?? ''}${r.glyphId ?? ''}`;
    case 'side':
    case 'facing':
      return `${r.kind}:${r.target}`;
    case 'direction':
      return `direction:${r.creature}:${r.facing}:${r.compareTo ?? ''}`;
    case 'path':
      return `path:${r.axis}`;
    case 'pick':
      return `pick:${r.target}:${r.options.map((o) => o.glyphId + o.transform).join()}`;
    case 'judge':
      return `judge:${r.glyphId}:${r.shown}`;
    case 'write':
      return `write:${r.glyphId}`;
    case 'sequence':
      return `sequence:${r.text}`;
  }
}
