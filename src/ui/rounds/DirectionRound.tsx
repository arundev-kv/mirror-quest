import { motion, useReducedMotion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import type { RoundOf } from '../../core/rounds';
import type { Side } from '../../core/types';
import { CreatureSvg } from '../components/Creature';
import { GhostHand } from '../components/GhostHand';
import { SIDE_COLORS } from '../components/sideColors';
import type { RoundProps } from './types';

type R = RoundOf<'direction'>;

/** "Which way?": tap the side it is heading to. "Same way?": are the two facing the same way? */
export function DirectionRound({ round, onAnswer, demo, onDemoDone, feedback }: RoundProps<R>) {
  const reduce = useReducedMotion();
  const [chosen, setChosen] = useState<string | null>(null);
  const same = round.compareTo !== undefined;
  const answer = same ? (round.compareTo === round.facing ? 'yes' : 'no') : round.facing;
  const reveal = feedback === 'reveal' || demo;

  const choose = (c: string) => {
    if (demo || feedback) return;
    setChosen(c);
    const correct = c === answer;
    onAnswer({ correct, reversal: correct ? undefined : 'direction' });
  };

  const drift = (facing: Side) =>
    reduce ? {} : { x: [0, facing === 'right' ? 10 : -10, 0], transition: { duration: 3, repeat: Infinity } };

  const btn = (id: string, testId: string, label: string, children: ReactNode, color?: string) => (
    <motion.button
      key={id}
      type="button"
      className={`choice-btn ${reveal && id === answer ? 'is-glow' : ''}`}
      style={color ? { borderColor: color } : undefined}
      data-testid={testId}
      data-correct={id === answer}
      aria-label={label}
      onClick={() => choose(id)}
      animate={feedback === 'tryAgain' && chosen === id ? { x: [0, -8, 8, -4, 0] } : {}}
    >
      {children}
    </motion.button>
  );

  const gx = same ? (answer === 'yes' ? 30 : 70) : answer === 'left' ? 22 : 78;
  return (
    <div className="round round--direction" data-answer={answer}>
      <div className="creature-stage">
        <motion.div animate={drift(round.facing)}>
          <CreatureSvg creature={round.creature} facing={round.facing} size={same ? 150 : 210} />
        </motion.div>
        {same && (
          <motion.div animate={drift(round.compareTo!)}>
            <CreatureSvg creature={round.creature} facing={round.compareTo!} size={150} />
          </motion.div>
        )}
      </div>
      <div className="choice-row">
        {same ? (
          <>
            {btn(
              'yes',
              'same-yes',
              'same way',
              <svg width="56" height="56" viewBox="0 0 24 24">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#4f9d4a" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>,
            )}
            {btn(
              'no',
              'same-no',
              'not the same way',
              <svg width="56" height="56" viewBox="0 0 24 24">
                <path
                  d="M4 9h13l-3-3M20 15H7l3 3"
                  stroke="#b5703d"
                  strokeWidth="2.6"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>,
            )}
          </>
        ) : (
          (['left', 'right'] as const).map((s) =>
            btn(
              s,
              `dir-${s}`,
              `going ${s}`,
              <svg width="64" height="64" viewBox="0 0 24 24">
                <path
                  d={s === 'left' ? 'M20 12H5m6-6l-6 6 6 6' : 'M4 12h15m-6-6l6 6-6 6'}
                  stroke={SIDE_COLORS[s]}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>,
              SIDE_COLORS[s],
            ),
          )
        )}
      </div>
      {demo && (
        <GhostHand
          steps={[
            { x: 50, y: 30 },
            { x: gx, y: 80 },
            { x: gx, y: 80, tap: true },
            { x: gx, y: 80 },
          ]}
          duration={3.9}
          onDone={onDemoDone}
        />
      )}
    </div>
  );
}
