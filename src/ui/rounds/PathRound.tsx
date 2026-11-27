import { motion } from 'framer-motion';
import { useState } from 'react';
import type { RoundOf } from '../../core/rounds';
import { GhostHand } from '../components/GhostHand';
import type { RoundProps } from './types';

type R = RoundOf<'path'>;

/** Where do we start? Tap the first picture: the LEFT end of a row, or the TOP of a column. */
export function PathRound({ round, onAnswer, demo, onDemoDone, feedback }: RoundProps<R>) {
  const [chosen, setChosen] = useState<number | null>(null);
  const reveal = feedback === 'reveal' || demo;
  const row = round.axis === 'horizontal';
  const choose = (i: number) => {
    if (demo || feedback) return;
    setChosen(i);
    onAnswer({ correct: i === 0, reversal: i === 0 ? undefined : 'start' });
  };
  return (
    <div className="round round--path">
      <div className={`path-track ${row ? 'is-row' : 'is-column'}`}>
        <svg className="path-arrow" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <path
            d={row ? 'M6 50 H94' : 'M50 6 V94'}
            stroke="#c9b48f"
            strokeWidth="3"
            strokeDasharray="5 5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {round.items.map((item, i) => (
          <motion.button
            key={i}
            type="button"
            className={`path-item ${reveal && i === 0 ? 'is-glow' : ''}`}
            data-testid={`path-item-${i}`}
            data-correct={i === 0}
            aria-label={`picture ${i + 1}`}
            onClick={() => choose(i)}
            animate={feedback === 'tryAgain' && chosen === i ? { x: [0, -8, 8, -4, 0] } : {}}
          >
            {item}
          </motion.button>
        ))}
      </div>
      {demo && (
        <GhostHand
          steps={[
            { x: 60, y: 60 },
            row ? { x: 16, y: 50 } : { x: 50, y: 14 },
            row ? { x: 16, y: 50, tap: true } : { x: 50, y: 14, tap: true },
            row ? { x: 16, y: 50 } : { x: 50, y: 14 },
          ]}
          duration={3.9}
          onDone={onDemoDone}
        />
      )}
    </div>
  );
}
