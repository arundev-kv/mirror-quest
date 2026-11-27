import type { Side } from '../../core/types';
import { SIDE_COLORS } from './sideColors';

/**
 * A hand held up with palm away, index finger up and thumb out.
 * The anchor is colour, not the "L" trick (that needs the letter L the right way round, which is what
 * these children mix up): left is always grass green, right is always sky blue. The left hand wears
 * a round sticker, like the one a grown-up puts on the child's left hand.
 */
export function HandIcon({
  side,
  size = 80,
  title,
  label,
}: {
  side: Side;
  size?: number;
  title?: string;
  label?: boolean;
}) {
  const color = SIDE_COLORS[side];
  const icon = (
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
        {side === 'left' && <circle cx="46" cy="70" r="9" fill="#ffffff" fillOpacity="0.85" />}
      </g>
    </svg>
  );
  if (!label) return icon;
  return (
    <span className="hand-label">
      {icon}
      <strong style={{ color, fontSize: Math.max(14, size * 0.24) }}>{side === 'left' ? 'LEFT' : 'RIGHT'}</strong>
    </span>
  );
}
