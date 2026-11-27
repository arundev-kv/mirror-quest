import { motion } from 'framer-motion';
import { useState } from 'react';
import { getGlyph } from '../../core/glyphs';
import type { MotorCue, RoundOf } from '../../core/rounds';
import { GhostHand } from '../components/GhostHand';
import { GlyphSvg } from '../components/GlyphSvg';
import type { RoundProps } from './types';

type R = RoundOf<'pick'>;

/** The first stroke a letter is taught with: a tall stick (b, p) or the magic c (d, q). */
export function CueIcon({ cue, size = 70 }: { cue: MotorCue; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      role="img"
      aria-label={cue === 'stick' ? 'stick first' : 'c first'}
    >
      {cue === 'stick' ? (
        <path d="M30 6 V54" stroke="#b5703d" strokeWidth="8" strokeLinecap="round" />
      ) : (
        <path d="M42 18 A16 16 0 1 0 42 42" stroke="#2f86c4" strokeWidth="8" fill="none" strokeLinecap="round" />
      )}
      <circle cx={cue === 'stick' ? 30 : 42} cy={cue === 'stick' ? 6 : 18} r="5" fill="#4f9d4a" />
    </svg>
  );
}

/** Tap the one that was asked for: the right way round, or the letter that was said. */
export function PickRound({ round, onAnswer, demo, onDemoDone, feedback }: RoundProps<R>) {
  const [chosen, setChosen] = useState<number | null>(null);
  const correctIdx = round.options.findIndex((o) => o.correct);
  const ref = round.refGlyph ? getGlyph(round.refGlyph) : null;
  const choose = (i: number) => {
    if (demo || feedback) return;
    setChosen(i);
    const correct = round.options[i].correct;
    onAnswer({ correct, reversal: correct ? undefined : round.target });
  };
  const n = round.options.length;
  const gx = ((correctIdx + 0.5) / n) * 100;
  return (
    <div className="round round--pick">
      {(ref || round.cue) && (
        <div className="prompt-card reference" data-testid="reference">
          {round.cue && <CueIcon cue={round.cue} />}
          {ref && <GlyphSvg glyphId={ref.id} size={84} />}
        </div>
      )}
      <div className="option-row">
        {round.options.map((o, i) => (
          <motion.button
            key={`${o.glyphId}-${o.transform}-${i}`}
            type="button"
            className={`glyph-card ${(feedback === 'reveal' || demo) && o.correct ? 'is-glow' : ''} ${feedback === 'correct' && o.correct ? 'is-right' : ''}`}
            data-testid={`option-${i}`}
            data-correct={o.correct}
            aria-label={`option ${i + 1}`}
            onClick={() => choose(i)}
            animate={
              feedback === 'tryAgain' && chosen === i
                ? { x: [0, -8, 8, -4, 0] }
                : feedback === 'correct' && o.correct
                  ? { scale: [1, 1.08, 1] }
                  : {}
            }
          >
            <GlyphSvg glyphId={o.glyphId} transform={o.transform} size={110} />
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
          duration={3.9}
          onDone={onDemoDone}
        />
      )}
    </div>
  );
}
