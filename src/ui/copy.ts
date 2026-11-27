import { getGlyph, glyphSpeech } from '../core/glyphs';
import type { Round } from '../core/rounds';
import type { Side } from '../core/types';

/**
 * In-play cues are ONE or two words, shown and spoken. Young children (and children with
 * learning difficulties) process less language while they are busy doing something.
 * Full sentences live only on the stage intro card (LevelConfig.intro).
 * Segments let the UI colour LEFT and RIGHT to match the hands.
 */
export type Segment = string | { side: Side };

export const SIDE_WORD: Record<Side, string> = { left: 'LEFT', right: 'RIGHT' };

const char = (id: string) => getGlyph(id).char;

/** A b-or-d pick: both options are real letters the right way round, so the letter is only heard. */
export const isListenPick = (r: Round) => r.kind === 'pick' && r.options.some((o) => o.glyphId !== r.target);

export function instructionFor(round: Round): Segment[] {
  switch (round.kind) {
    case 'body':
      switch (round.move) {
        case 'wave':
          return ['Wave', { side: round.side ?? 'left' }];
        case 'stamp':
          return ['Stamp', { side: round.side ?? 'left' }];
        case 'skyline':
          return ['Sky lines'];
        case 'armcircle':
          return ['Big c'];
        case 'skywrite':
          return [`Sky ${char(round.glyphId ?? 'b')}`];
        case 'backtoback':
          return ['Back to back'];
      }
      return ['Move'];
    case 'side':
    case 'facing':
      return [{ side: round.target }];
    case 'direction':
      return [round.compareTo ? 'Same way?' : 'Which way?'];
    case 'path':
      return ['Start'];
    case 'pick':
      return isListenPick(round) ? ['Listen'] : [char(round.target)];
    case 'judge':
      return [char(round.glyphId)];
    case 'write': {
      const verb = round.modelMs ? 'Write' : round.guideOpacity >= 0.5 ? 'Trace' : 'Write';
      return getGlyph(round.glyphId).kind === 'stroke' ? [verb] : [`${verb} ${char(round.glyphId)}`];
    }
    case 'sequence':
      return ['Which one?'];
  }
}

/** What the voice says: the same word(s). Letters are spoken on their own ("b" reads as "bee"). */
export function instructionSpeech(round: Round): string {
  if (round.kind === 'pick' && isListenPick(round)) return glyphSpeech(round.target);
  if (round.kind === 'sequence') return round.text; // "bed", "12" ("twelve")
  if (round.kind === 'write' && getGlyph(round.glyphId).kind === 'stroke')
    return `${instructionFor(round)[0]} ${glyphSpeech(round.glyphId)}`;
  if (round.kind === 'body' && round.move === 'skywrite') return `Sky ${glyphSpeech(round.glyphId ?? 'b')}`;
  return instructionFor(round)
    .map((s) => (typeof s === 'string' ? s : SIDE_WORD[s.side].toLowerCase()))
    .join(' ');
}

export type FeedbackKind = 'correct' | 'tryAgain' | 'mirrored' | 'flipped' | 'start' | 'reveal' | 'done';

/** One or two words each. Warm, never "wrong". */
export const FEEDBACK_TEXT: Record<FeedbackKind, string> = {
  correct: 'Yes!',
  tryAgain: 'Again',
  mirrored: 'Flip',
  flipped: 'Flip',
  start: 'Green dot',
  reveal: 'Look',
  done: 'Great',
};

export const WATCH_WORD = 'Watch';
export const YOUR_TURN_WORD = 'Your turn';
