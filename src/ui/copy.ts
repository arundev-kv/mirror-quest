import { getGlyph } from '../core/glyphs';
import type { Round } from '../core/levels';
import type { Side } from '../core/types';

/**
 * Written instructions. Short and plain, so a grown-up can read them aloud and early
 * readers can follow along. The ghost-hand demo still shows the same thing without words.
 * Segments let the UI colour the words LEFT (sage) and RIGHT (sky).
 */
export type Segment = string | { side: Side };

const sideWord = (side: Side): Segment => ({ side });

export function instructionFor(round: Round): Segment[] {
  switch (round.kind) {
    case 'side':
      return ['Tap the picture on your ', sideWord(round.target), ' side.'];
    case 'facing':
      return round.view === 'front'
        ? ['Your friend is facing you. Tap what is in their ', sideWord(round.target), ' hand.']
        : ['Your friend has turned around. Tap what is in their ', sideWord(round.target), ' hand.'];
    case 'pick':
      return round.showReference
        ? [`Find the ${getGlyph(round.glyphId).char} that looks just like the card at the top.`]
        : [`Tap the ${getGlyph(round.glyphId).char} that faces the right way.`];
    case 'judge':
      return [`Is this ${getGlyph(round.glyphId).char} the right way round? Tap ✓ if it is, or ↔ to flip it.`];
    case 'write':
      return round.showStart
        ? [`Trace the ${getGlyph(round.glyphId).char}. Start at green dot 1 and follow the arrow. Then tap ✓.`]
        : [`Write the ${getGlyph(round.glyphId).char}. Then tap ✓.`];
  }
}

/** A tip shown under the instruction when the level gives hints. */
export function hintFor(round: Round): string | null {
  if (round.kind === 'side' && round.hint) return 'Tip: your left hand makes an L shape.';
  if (round.kind === 'facing' && round.hint) {
    return round.view === 'front'
      ? 'Tip: when a friend faces you, their left hand is on YOUR right side. Look for the green bracelet.'
      : 'Tip: when a friend faces away, their left is on your left too.';
  }
  return null;
}

export type FeedbackKind = 'correct' | 'tryAgain' | 'mirrored' | 'flipped' | 'reveal';

export const FEEDBACK_TEXT: Record<FeedbackKind, string> = {
  correct: 'Well done!',
  tryAgain: 'Almost! Have another go.',
  mirrored: 'It is facing the other way. Watch it flip, then try again.',
  flipped: 'It is upside down. Try again.',
  reveal: "Here is the right one. Let's keep going!",
};

/** Plain text of an instruction, for speaking aloud. Letters are said as "the letter b". */
export function instructionSpeech(round: Round): string {
  const text = instructionFor(round)
    .map((s) => (typeof s === 'string' ? s : SIDE_WORD[s.side].toLowerCase()))
    .join('');
  if (round.kind === 'pick' || round.kind === 'judge' || round.kind === 'write') {
    const ch = getGlyph(round.glyphId).char;
    return text
      .replace(new RegExp(`the ${ch} `, 'g'), `the letter ${ch}, `)
      .replace(`this ${ch} `, `this letter ${ch} `);
  }
  return text;
}

export const SIDE_WORD: Record<Side, string> = { left: 'LEFT', right: 'RIGHT' };
