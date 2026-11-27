import { motion } from 'framer-motion';
import { useState } from 'react';
import { AMBIGUOUS_MIRROR, getGlyph } from '../../core/glyphs';
import type { Round } from '../../core/levels';
import { audio } from '../../audio/engine';
import { GhostHand } from '../components/GhostHand';
import { GlyphSvg } from '../components/GlyphSvg';
import type { RoundProps } from './types';

type R = Extract<Round, { kind: 'judge' }>;

/** Is this one facing the right way? Tap the thumbs-up, or tap flip to turn it around. */
export function JudgeRound({ round, onAnswer, demo, onDemoDone, feedback }: RoundProps<R>) {
  const [flipped, setFlipped] = useState(false);
  const glyph = getGlyph(round.glyphId);
  const isRight = round.shown === 'identity';
  const showRef = AMBIGUOUS_MIRROR.has(round.glyphId);

  const answer = (saysRight: boolean) => {
    if (demo || feedback) return;
    const correct = saysRight === isRight;
    if (!saysRight) {
      setFlipped(true);
      audio.play('flip');
    }
    onAnswer({ correct, reversal: correct ? undefined : round.glyphId });
  };
  // While trying again, turn it back so the child sees the original again.
  const showFlip = flipped && feedback !== 'tryAgain';
  const gx = isRight ? 32 : 68;

  return (
    <div className="round round--judge">
      {showRef && (
        <div className="prompt-card reference">
          <GlyphSvg glyphId={round.glyphId} size={60} />
          {glyph.anchor && <span className="anchor">{glyph.anchor}</span>}
        </div>
      )}
      <motion.div
        className="judge-card"
        data-testid="judge-card"
        data-shown={round.shown}
        animate={{ rotateY: showFlip || (feedback === 'reveal' && !isRight) ? 180 : 0 }}
        transition={{ duration: 0.7 }}
      >
        <GlyphSvg glyphId={round.glyphId} transform={round.shown} size={150} />
      </motion.div>
      <div className="judge-buttons">
        <motion.button
          type="button"
          className={`judge-btn ${(demo || feedback === 'reveal') && isRight ? 'is-glow' : ''}`}
          aria-label="looks right"
          data-testid="judge-yes"
          onClick={() => answer(true)}
          whileTap={{ scale: 0.92 }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="#5f8f6f"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.button>
        <motion.button
          type="button"
          className={`judge-btn ${(demo || feedback === 'reveal') && !isRight ? 'is-glow' : ''}`}
          aria-label="flip it"
          data-testid="judge-flip"
          onClick={() => answer(false)}
          whileTap={{ scale: 0.92 }}
        >
          <svg width="56" height="56" viewBox="0 0 24 24">
            <path d="M12 3v18" stroke="#9aa6b2" strokeWidth="1.5" strokeDasharray="2 2" />
            <path d="M9 7L4 12l5 5V7z" fill="#8fb1c9" />
            <path d="M15 7l5 5-5 5V7z" fill="#8fb1c9" />
          </svg>
        </motion.button>
      </div>
      {demo && (
        <GhostHand
          steps={[
            { x: 50, y: 40 },
            { x: gx, y: 82 },
            { x: gx, y: 82, tap: true },
            { x: gx, y: 82 },
          ]}
          duration={2.6}
          onDone={onDemoDone}
        />
      )}
    </div>
  );
}
