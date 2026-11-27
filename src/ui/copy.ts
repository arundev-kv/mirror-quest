import { getGlyph } from '../core/glyphs';
import type { Round } from '../core/levels';
import type { Side } from '../core/types';

/**
 * In-play cues are ONE or two words, shown and spoken. Young children (and children with
 * learning difficulties) process less language while they are busy doing something.
 * Full sentences live only on the stage intro card (LevelConfig.intro).
 * Segments let the UI colour LEFT and RIGHT to match the hands.
 */
export type Segment = string | { side: Side };

export const SIDE_WORD: Record<Side, string> = { left: 'LEFT', right: 'RIGHT' };

export function instructionFor(round: Round): Segment[] {
  switch (round.kind) {
    case 'side':
    case 'facing':
      return [{ side: round.target }];
    case 'pick':
    case 'judge':
      return [getGlyph(round.glyphId).char];
    case 'write':
      return [`${round.guideOpacity >= 0.5 ? 'Trace' : 'Write'} ${getGlyph(round.glyphId).char}`];
  }
}

/** What the voice says: the same word(s). Letters are spoken on their own ("b" reads as "bee"). */
export function instructionSpeech(round: Round): string {
  return instructionFor(round)
    .map((s) => (typeof s === 'string' ? s : SIDE_WORD[s.side].toLowerCase()))
    .join(' ');
}

export type FeedbackKind = 'correct' | 'tryAgain' | 'mirrored' | 'flipped' | 'reveal';

/** One word each. Warm, never "wrong". */
export const FEEDBACK_TEXT: Record<FeedbackKind, string> = {
  correct: 'Yes!',
  tryAgain: 'Again',
  mirrored: 'Flip',
  flipped: 'Flip',
  reveal: 'Look',
};

export const WATCH_WORD = 'Watch';
