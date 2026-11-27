import { motion } from 'framer-motion';
import { useState } from 'react';
import { screenSideForFacing, type Round } from '../../core/levels';
import type { Side } from '../../core/types';
import { GhostHand } from '../components/GhostHand';
import { HandIcon } from '../components/HandIcon';
import { SIDE_COLORS } from '../components/sideColors';
import type { RoundProps } from './types';

type R = Extract<Round, { kind: 'facing' }>;

/** Stage size; the friend's hands sit at HAND_X from each edge. */
const STAGE_W = 560;
const STAGE_H = 320;
const HAND_X = 90;
const HAND_Y = 70;

/** A friend who faces me (or turns away), arms up, holding one thing in each hand. */
function Friend({ view, hint }: { view: 'front' | 'back'; hint: boolean }) {
  // The friend's own left hand is on screen-right when facing me, screen-left when facing away.
  const friendLeftOnScreen = screenSideForFacing('left', view);
  const wristX = friendLeftOnScreen === 'left' ? HAND_X + 34 : STAGE_W - HAND_X - 34;
  const cx = STAGE_W / 2;
  return (
    <svg className="friend" width={STAGE_W} height={STAGE_H} viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} aria-hidden="true">
      <path
        d={`M${cx - 48} 200 Q${HAND_X + 60} 190 ${HAND_X + 22} ${HAND_Y + 60}`}
        stroke="#e6c7a8"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d={`M${cx + 48} 200 Q${STAGE_W - HAND_X - 60} 190 ${STAGE_W - HAND_X - 22} ${HAND_Y + 60}`}
        stroke="#e6c7a8"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      {hint && (
        <circle
          cx={wristX - (friendLeftOnScreen === 'left' ? 8 : -8)}
          cy={HAND_Y + 84}
          r="15"
          fill="none"
          stroke={SIDE_COLORS.left}
          strokeWidth="9"
        />
      )}
      <rect x={cx - 62} y="180" width="124" height="140" rx="50" fill="#b7c7dd" />
      <circle cx={cx} cy="130" r="56" fill="#efd3b8" />
      {view === 'front' ? (
        <>
          <path
            d={`M${cx - 56} 118 Q${cx} 52 ${cx + 56} 118 Q${cx + 28} 94 ${cx} 96 Q${cx - 28} 94 ${cx - 56} 118 Z`}
            fill="#8a6f5c"
          />
          <circle cx={cx - 20} cy="134" r="6.5" fill="#3f3b3a" />
          <circle cx={cx + 20} cy="134" r="6.5" fill="#3f3b3a" />
          <path
            d={`M${cx - 16} 156 Q${cx} 170 ${cx + 16} 156`}
            stroke="#7b6460"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />
          <circle cx={cx - 36} cy="152" r="7" fill="#e9b9b4" opacity="0.6" />
          <circle cx={cx + 36} cy="152" r="7" fill="#e9b9b4" opacity="0.6" />
        </>
      ) : (
        <path
          d={`M${cx - 56} 130 Q${cx - 56} 72 ${cx} 72 Q${cx + 56} 72 ${cx + 56} 130 Q${cx + 56} 184 ${cx} 186 Q${cx - 56} 184 ${cx - 56} 130 Z`}
          fill="#8a6f5c"
        />
      )}
    </svg>
  );
}

export function FacingRound({ round, onAnswer, demo, onDemoDone, feedback }: RoundProps<R>) {
  const [chosen, setChosen] = useState<Side | null>(null);
  const correctScreenSide = screenSideForFacing(round.target, round.view);
  const choose = (side: Side) => {
    if (demo || feedback) return;
    setChosen(side);
    const correct = side === correctScreenSide;
    onAnswer({ correct, reversal: correct ? undefined : 'left-right' });
  };
  const gx = correctScreenSide === 'left' ? 29 : 71;
  return (
    <div className="round round--facing">
      <div className="prompt-card" data-testid="prompt" data-target={round.target}>
        <HandIcon side={round.target} size={96} />
      </div>
      <div className="facing-stage" data-view={round.view} style={{ width: STAGE_W, height: STAGE_H }}>
        {(['left', 'right'] as const).map((side, i) => (
          <motion.button
            key={side}
            type="button"
            style={{ left: side === 'left' ? HAND_X - 60 : STAGE_W - HAND_X - 60, top: HAND_Y - 60 }}
            className={`facing-item ${(feedback === 'reveal' || demo) && side === correctScreenSide ? 'is-glow' : ''}`}
            data-testid={`facing-${side}`}
            aria-label={`friend hand on screen ${side}`}
            onClick={() => choose(side)}
            animate={feedback === 'tryAgain' && chosen === side ? { x: [0, -8, 8, -4, 0] } : {}}
          >
            {round.items[i]}
          </motion.button>
        ))}
        <Friend view={round.view} hint={round.hint} />
      </div>
      {demo && (
        <GhostHand
          steps={[
            { x: 50, y: 20 },
            { x: gx, y: 46 },
            { x: gx, y: 46, tap: true },
            { x: gx, y: 46 },
          ]}
          duration={2.8}
          onDone={onDemoDone}
        />
      )}
    </div>
  );
}
