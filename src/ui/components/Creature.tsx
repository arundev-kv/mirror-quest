import type { ReactElement } from 'react';
import type { Creature } from '../../core/rounds';
import type { Side } from '../../core/types';

/**
 * Simple side-view pictures, all drawn facing RIGHT; LEFT is the exact mirror image.
 * The point of level 2 is that a mirror image points the other way, so nothing else changes.
 */
export function CreatureSvg({ creature, facing, size = 180 }: { creature: Creature; facing: Side; size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.75}
      viewBox="0 0 160 120"
      role="img"
      aria-label={`${creature} going ${facing}`}
      data-facing={facing}
    >
      <g transform={facing === 'left' ? 'translate(160 0) scale(-1 1)' : undefined}>{SHAPES[creature]}</g>
    </svg>
  );
}

const leg = (x: number) => <rect x={x} y="78" width="9" height="30" rx="4" fill="#7a5a3a" />;

const SHAPES: Record<Creature, ReactElement> = {
  goat: (
    <g>
      {leg(40)}
      {leg(58)}
      {leg(90)}
      {leg(106)}
      <ellipse cx="74" cy="66" rx="46" ry="24" fill="#f4efe6" stroke="#b9a98f" strokeWidth="3" />
      <path d="M28 58 q-14 -6 -12 -18" stroke="#b9a98f" strokeWidth="5" fill="none" strokeLinecap="round" />
      <ellipse cx="128" cy="44" rx="18" ry="14" fill="#f4efe6" stroke="#b9a98f" strokeWidth="3" />
      <path
        d="M122 32 q-4 -16 -16 -18 M132 31 q2 -16 -8 -22"
        stroke="#8c6d4a"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="134" cy="41" r="3" fill="#2f3e4c" />
      <path d="M140 54 q2 10 -6 14" stroke="#b9a98f" strokeWidth="3" fill="none" />
    </g>
  ),
  cow: (
    <g>
      {leg(38)}
      {leg(56)}
      {leg(92)}
      {leg(108)}
      <ellipse cx="74" cy="64" rx="48" ry="26" fill="#ffffff" stroke="#8a7b6e" strokeWidth="3" />
      <ellipse cx="60" cy="58" rx="12" ry="9" fill="#6b5446" />
      <ellipse cx="90" cy="72" rx="10" ry="7" fill="#6b5446" />
      <path d="M26 58 q-12 6 -10 24" stroke="#8a7b6e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <ellipse cx="128" cy="48" rx="18" ry="16" fill="#ffffff" stroke="#8a7b6e" strokeWidth="3" />
      <ellipse cx="140" cy="56" rx="10" ry="8" fill="#f3c3b4" />
      <path d="M118 34 l-6 -10 M134 32 l4 -11" stroke="#c9b28a" strokeWidth="4" strokeLinecap="round" />
      <circle cx="132" cy="44" r="3" fill="#2f3e4c" />
    </g>
  ),
  duck: (
    <g>
      <ellipse cx="70" cy="78" rx="46" ry="26" fill="#ffd95a" stroke="#d9a520" strokeWidth="3" />
      <path d="M36 70 q20 -14 44 0" stroke="#d9a520" strokeWidth="3" fill="none" />
      <circle cx="114" cy="42" r="20" fill="#ffd95a" stroke="#d9a520" strokeWidth="3" />
      <path d="M130 44 l22 4 l-20 8 z" fill="#f29a38" />
      <circle cx="118" cy="38" r="3.5" fill="#2f3e4c" />
      <path d="M24 70 l-14 -10 l4 18 z" fill="#ffd95a" stroke="#d9a520" strokeWidth="3" />
    </g>
  ),
  snail: (
    <g>
      <path d="M16 100 h120 q14 0 14 -12 v-30" stroke="#a7c68f" strokeWidth="16" fill="none" strokeLinecap="round" />
      <path d="M142 58 l-6 -22 M152 58 l6 -20" stroke="#a7c68f" strokeWidth="4" strokeLinecap="round" />
      <circle cx="136" cy="36" r="4" fill="#2f3e4c" />
      <circle cx="158" cy="38" r="4" fill="#2f3e4c" />
      <circle cx="70" cy="64" r="36" fill="#e4a463" stroke="#b5703d" strokeWidth="3" />
      <path
        d="M70 64 m0 -8 a8 8 0 1 1 -8 8 a16 16 0 0 1 16 -16 a24 24 0 0 1 24 24"
        stroke="#b5703d"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  ),
  fish: (
    <g>
      <path d="M38 60 L8 34 L14 60 L8 86 Z" fill="#7cc4ef" stroke="#2f86c4" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="84" cy="60" rx="54" ry="32" fill="#7cc4ef" stroke="#2f86c4" strokeWidth="3" />
      <path d="M70 32 q12 -14 30 -4" stroke="#2f86c4" strokeWidth="3" fill="#7cc4ef" />
      <circle cx="118" cy="52" r="5" fill="#2f3e4c" />
      <path d="M132 68 q-6 6 -12 4" stroke="#2f3e4c" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  ),
};
