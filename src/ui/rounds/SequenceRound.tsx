import { motion } from 'framer-motion';
import { useState } from 'react';
import type { RoundOf } from '../../core/rounds';
import { GhostHand } from '../components/GhostHand';
import { GlyphSvg } from '../components/GlyphSvg';
import type { RoundProps } from './types';

type R = RoundOf<'sequence'>;

/** Tens as a bar of ten beads, ones as single beads: 12 and 21 look clearly different. */
function Beads({ n }: { n: number }) {
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return (
    <div className="beads" aria-label={`${n} beads`}>
      {Array.from({ length: tens }, (_, t) => (
        <span key={`t${t}`} className="bead-bar">
          {Array.from({ length: 10 }, (_, i) => (
            <i key={i} />
          ))}
        </span>
      ))}
      <span className="bead-ones">
        {Array.from({ length: ones }, (_, i) => (
          <i key={i} />
        ))}
      </span>
    </div>
  );
}

/** Which one is written left to right, every character the right way round? */
export function SequenceRound({ round, onAnswer, demo, onDemoDone, feedback }: RoundProps<R>) {
  const [chosen, setChosen] = useState<number | null>(null);
  const correctIdx = round.options.findIndex((o) => o.correct);
  const choose = (i: number) => {
    if (demo || feedback) return;
    setChosen(i);
    const correct = round.options[i].correct;
    onAnswer({ correct, reversal: correct ? undefined : round.text });
  };
  const n = round.options.length;
  const gx = ((correctIdx + 0.5) / n) * 100;
  return (
    <div className="round round--sequence">
      <div className="prompt-card reference" data-testid="clue">
        {round.clueType === 'picture' ? (
          <span className="seq-picture">{round.clue}</span>
        ) : (
          <Beads n={Number(round.clue)} />
        )}
      </div>
      <div className="option-row">
        {round.options.map((o, i) => (
          <motion.button
            key={i}
            type="button"
            className={`seq-card ${(feedback === 'reveal' || demo) && o.correct ? 'is-glow' : ''} ${feedback === 'correct' && o.correct ? 'is-right' : ''}`}
            data-testid={`seq-option-${i}`}
            data-correct={o.correct}
            aria-label={`option ${i + 1}`}
            onClick={() => choose(i)}
            animate={feedback === 'tryAgain' && chosen === i ? { x: [0, -8, 8, -4, 0] } : {}}
          >
            {o.chars.map((c, k) => (
              <GlyphSvg
                key={k}
                glyphId={c.glyphId}
                transform={c.transform}
                size={round.text.length > 2 ? 54 : 64}
                strokeWidth={10}
              />
            ))}
          </motion.button>
        ))}
      </div>
      {demo && (
        <GhostHand
          steps={[
            { x: 50, y: 30 },
            { x: gx, y: 70 },
            { x: gx, y: 70, tap: true },
            { x: gx, y: 70 },
          ]}
          duration={3.9}
          onDone={onDemoDone}
        />
      )}
    </div>
  );
}
