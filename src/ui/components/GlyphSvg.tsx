import { motion } from 'framer-motion';
import { GLYPH_BOX, strokesToPath, transformStrokes, type Transform } from '../../core/geometry';
import { getGlyph } from '../../core/glyphs';

interface Props {
  glyphId: string;
  transform?: Transform;
  size?: number;
  color?: string;
  opacity?: number;
  strokeWidth?: number;
  /** Show the green start dot and direction arrows (for tracing). */
  showStart?: boolean;
  /** Animate the strokes being drawn, in order (ghost-hand demo). */
  animateDraw?: boolean;
  drawDuration?: number;
  className?: string;
}

export function GlyphSvg({
  glyphId,
  transform = 'identity',
  size = 160,
  color = '#4f5d6b',
  opacity = 1,
  strokeWidth = 9,
  showStart,
  animateDraw,
  drawDuration = 1.2,
  className,
}: Props) {
  const glyph = getGlyph(glyphId);
  const strokes = transformStrokes(glyph.strokes, transform);
  const h = (size * GLYPH_BOX.height) / GLYPH_BOX.width;
  return (
    <svg
      className={className}
      width={size}
      height={h}
      viewBox={`0 0 ${GLYPH_BOX.width} ${GLYPH_BOX.height}`}
      aria-hidden="true"
      style={{ opacity, overflow: 'visible' }}
    >
      {strokes.map((s, i) => (
        <motion.path
          key={`${glyphId}-${transform}-${i}-${animateDraw ? 'a' : 's'}`}
          d={strokesToPath([s])}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animateDraw ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={
            animateDraw ? { duration: drawDuration, delay: i * (drawDuration + 0.25), ease: 'easeInOut' } : undefined
          }
        />
      ))}
      {showStart &&
        strokes.map((s, i) => {
          const a = s[0];
          const b = s[Math.min(s.length - 1, 4)];
          const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
          return (
            <g key={`start-${i}`}>
              <circle cx={a.x} cy={a.y} r={6.5} fill="#4f9d4a" stroke="#fff" strokeWidth={2} />
              <text x={a.x} y={a.y + 3.2} fontSize="8" textAnchor="middle" fill="#fff" fontWeight="700">
                {i + 1}
              </text>
              <g transform={`translate(${a.x} ${a.y}) rotate(${ang}) translate(13 0)`}>
                <path
                  d="M-4 -4 L3 0 L-4 4"
                  stroke="#4f9d4a"
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            </g>
          );
        })}
    </svg>
  );
}
