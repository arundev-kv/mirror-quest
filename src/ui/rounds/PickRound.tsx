import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Transform } from '../../core/geometry';
import { getGlyph } from '../../core/glyphs';
import type { Round } from '../../core/levels';
import { GhostHand } from '../components/GhostHand';
import { GlyphSvg } from '../components/GlyphSvg';
import type { RoundProps } from './types';

type R = Extract<Round, { kind: 'pick' }>;

/** Which one faces the right way? (matches the reference card) */
export function PickRound({ round, onAnswer, demo, onDemoDone, feedback }: RoundProps<R>) {
  const [chosen, setChosen] = useState<number | null>(null);
  const glyph = getGlyph(round.glyphId);
  const correctIdx = round.options.indexOf('identity');
  const choose = (i: number, t: Transform) => {
    if (demo || feedback) return;
    setChosen(i);
    const correct = t === 'identity';
    onAnswer({ correct, reversal: correct ? undefined : round.glyphId });
  };
  const n = round.options.length;
  const gx = ((correctIdx + 0.5) / n) * 100;
  return (
    <div className="round round--pick">
      {round.showReference && (
        <div className="prompt-card reference" data-testid="reference">
          <GlyphSvg glyphId={round.glyphId} size={84} />
          {glyph.anchor && <span className="anchor">{glyph.anchor}</span>}
        </div>
      )}
      <div className="option-row">
        {round.options.map((t, i) => (
          <motion.button
            key={`${t}-${i}`}
            type="button"
            className={`glyph-card ${(feedback === 'reveal' || demo) && t === 'identity' ? 'is-glow' : ''} ${feedback === 'correct' && t === 'identity' ? 'is-right' : ''}`}
            data-testid={`option-${i}`}
            data-correct={t === 'identity'}
            aria-label={`option ${i + 1}`}
            onClick={() => choose(i, t)}
            animate={
              feedback === 'tryAgain' && chosen === i
                ? { x: [0, -8, 8, -4, 0] }
                : feedback === 'correct' && t === 'identity'
                  ? { scale: [1, 1.08, 1] }
                  : {}
            }
          >
            <GlyphSvg glyphId={round.glyphId} transform={t} size={110} />
          </motion.button>
        ))}
      </div>
      {demo && (
        <GhostHand
          steps={[
            { x: 50, y: 30 },
            { x: gx, y: 68 },
            { x: gx, y: 68, tap: true },
            { x: gx, y: 68 },
          ]}
          duration={2.6}
          onDone={onDemoDone}
        />
      )}
    </div>
  );
}
