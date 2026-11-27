import type { Side } from '../../core/types';
import { SIDE_COLORS } from './sideColors';

/**
 * A hand held up with palm away, index finger up and thumb out.
 * The LEFT hand makes a proper "L" — the classic memory trick.
 * Left is always sage green; right is always sky blue (consistent colour anchors).
 */
export function HandIcon({ side, size = 80, title }: { side: Side; size?: number; title?: string }) {
  const color = SIDE_COLORS[side];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={title ?? `${side} hand`}>
      <g transform={side === 'right' ? 'translate(100 0) scale(-1 1)' : undefined}>
        {/* index finger */}
        <rect x="26" y="8" width="16" height="50" rx="8" fill={color} />
        {/* curled fingers */}
        <rect x="40" y="40" width="14" height="22" rx="7" fill={color} opacity="0.85" />
        <rect x="52" y="44" width="13" height="20" rx="6.5" fill={color} opacity="0.85" />
        {/* palm */}
        <rect x="24" y="48" width="44" height="40" rx="14" fill={color} />
        {/* thumb sticking out to make the L */}
        <rect x="58" y="64" width="34" height="15" rx="7.5" fill={color} />
        {side === 'left' && (
          <path
            d="M34 20 V78 H82"
            stroke="#ffffff"
            strokeOpacity="0.75"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </g>
    </svg>
  );
}
