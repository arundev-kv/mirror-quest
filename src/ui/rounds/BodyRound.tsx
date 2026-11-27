import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { RoundOf } from '../../core/rounds';
import type { Side } from '../../core/types';
import { GlyphSvg } from '../components/GlyphSvg';
import { IconButton } from '../components/IconButton';
import { SIDE_COLORS } from '../components/sideColors';
import type { RoundProps } from './types';

type R = RoundOf<'body'>;

/** The Done button appears after a short moment, so the warm-up is actually done, not skipped. */
const DONE_AFTER_MS = 3000;

/**
 * Unscored movement warm-up away from the screen. The figure is seen from BEHIND,
 * so its left is on the child's left, like a mirror that doesn't swap.
 */
export function BodyRound({ round, onAnswer, feedback }: RoundProps<R>) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), DONE_AFTER_MS);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div className="round round--body" data-move={round.move}>
      <div className="body-stage">
        {round.move === 'wave' || round.move === 'stamp' ? (
          <Figure move={round.move} side={round.side ?? 'left'} />
        ) : round.move === 'backtoback' ? (
          <div className="body-pair">
            <Figure size={200} />
            <Figure size={150} />
          </div>
        ) : (
          <SkyDrawing round={round} />
        )}
      </div>
      <IconButton
        label="done"
        variant="primary"
        size={96}
        onClick={() => !feedback && onAnswer({ correct: true })}
        testId="body-done"
        disabled={!ready || !!feedback}
      >
        <svg width="44" height="44" viewBox="0 0 24 24">
          <path d="M5 12.5l4.5 4.5L19 7.5" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </IconButton>
    </div>
  );
}

/** A child seen from behind. The left hand wears the green sticker. */
function Figure({ move, side, size = 220 }: { move?: 'wave' | 'stamp'; side?: Side; size?: number }) {
  const reduce = useReducedMotion();
  const arm = (s: Side) => {
    const up = move === 'wave' && s === side;
    const x = s === 'left' ? 34 : 86;
    const color = up ? SIDE_COLORS[s] : '#e8c9a8';
    const d = up ? `M${x} 52 L${s === 'left' ? 14 : 106} 14` : `M${x} 52 L${s === 'left' ? 22 : 98} 96`;
    return (
      <motion.g
        key={`arm-${s}`}
        style={{ originX: `${x}px`, originY: '52px' }}
        animate={up && !reduce ? { rotate: s === 'left' ? [0, -10, 0, 10, 0] : [0, 10, 0, -10, 0] } : {}}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        <path d={d} stroke={color} strokeWidth="12" strokeLinecap="round" />
        {s === 'left' && (
          <circle cx={up ? 14 : 22} cy={up ? 14 : 96} r="6" fill={SIDE_COLORS.left} stroke="#fff" strokeWidth="2" />
        )}
      </motion.g>
    );
  };
  const leg = (s: Side) => {
    const lift = move === 'stamp' && s === side;
    const x = s === 'left' ? 50 : 70;
    return (
      <motion.path
        key={`leg-${s}`}
        d={`M${x} 104 L${x} 150`}
        stroke={lift ? SIDE_COLORS[s] : '#5d6f7f'}
        strokeWidth="13"
        strokeLinecap="round"
        animate={lift && !reduce ? { y: [0, -16, 0, 0] } : {}}
        transition={{ duration: 1.6, repeat: Infinity }}
      />
    );
  };
  return (
    <svg width={size} height={size * 1.35} viewBox="0 0 120 162" role="img" aria-label="a child seen from behind">
      {leg('left')}
      {leg('right')}
      <rect x="34" y="44" width="52" height="64" rx="18" fill="#f2c14e" />
      {arm('left')}
      {arm('right')}
      <circle cx="60" cy="26" r="20" fill="#8b5e3c" />
    </svg>
  );
}

/** Skywriting: a big glyph (or the writing lines, or the magic c) drawn slowly, again and again. */
function SkyDrawing({ round }: { round: R }) {
  const reduce = useReducedMotion();
  const [cycle, setCycle] = useState(0);
  const glyphs =
    round.move === 'skyline' ? ['hline', 'vline'] : round.move === 'armcircle' ? ['circle'] : [round.glyphId ?? 'b'];
  const id = glyphs[cycle % glyphs.length];
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setCycle((c) => c + 1), 4200);
    return () => window.clearInterval(t);
  }, [reduce]);
  return (
    <div className="sky-drawing">
      <GlyphSvg
        key={`${id}-${cycle}`}
        glyphId={id}
        size={240}
        color="#2f86c4"
        strokeWidth={8}
        showStart
        animateDraw={!reduce}
        drawDuration={2.2}
      />
    </div>
  );
}
