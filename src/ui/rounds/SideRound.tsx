import { motion } from 'framer-motion';
import { useState } from 'react';
import type { Round } from '../../core/levels';
import type { Side } from '../../core/types';
import { GhostHand } from '../components/GhostHand';
import { HandIcon } from '../components/HandIcon';
import type { RoundProps } from './types';

type R = Extract<Round, { kind: 'side' }>;

/** Tap the thing on MY left / right. */
export function SideRound({ round, onAnswer, demo, onDemoDone, feedback }: RoundProps<R>) {
  const [chosen, setChosen] = useState<Side | null>(null);
  const reveal = feedback === 'reveal' || demo;
  const choose = (side: Side) => {
    if (demo || feedback) return;
    setChosen(side);
    const correct = side === round.target;
    onAnswer({ correct, reversal: correct ? undefined : 'left-right' });
  };

  return (
    <div className="round round--side">
      <div className="prompt-card" data-testid="prompt" data-target={round.target}>
        <HandIcon side={round.target} size={88} label />
      </div>
      <div className="side-row">
        {(['left', 'right'] as const).map((side, i) => {
          const isTarget = side === round.target;
          const wrong = feedback === 'tryAgain' && chosen === side;
          return (
            <motion.button
              key={side}
              type="button"
              className={`side-item ${reveal && isTarget ? 'is-glow' : ''}`}
              data-testid={`side-${side}`}
              aria-label={`${side} ${round.items[i]}`}
              onClick={() => choose(side)}
              animate={wrong ? { x: [0, -8, 8, -4, 0] } : feedback === 'correct' && isTarget ? { y: [0, -16, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              <span className="side-emoji">{round.items[i]}</span>
              {round.hint && (
                <span className="side-hint">
                  <HandIcon side={side} size={36} label />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      {demo && (
        <GhostHand
          steps={[
            { x: 50, y: 20 },
            { x: round.target === 'left' ? 25 : 75, y: 62 },
            { x: round.target === 'left' ? 25 : 75, y: 62, tap: true },
            { x: round.target === 'left' ? 25 : 75, y: 62 },
          ]}
          duration={3.9}
          onDone={onDemoDone}
        />
      )}
    </div>
  );
}
