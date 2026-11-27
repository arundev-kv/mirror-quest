import { motion } from 'framer-motion';

export interface GhostStep {
  /** Position in % of the parent box. */
  x: number;
  y: number;
  tap?: boolean;
}

/**
 * A translucent pointing hand that demonstrates what to do (kids can't read and
 * there is no voice). The parent must be position: relative.
 */
export function GhostHand({
  steps,
  duration = 2.4,
  onDone,
}: {
  steps: GhostStep[];
  duration?: number;
  onDone?: () => void;
}) {
  const xs = steps.map((s) => `${s.x}%`);
  const ys = steps.map((s) => `${s.y}%`);
  const scales = steps.map((s) => (s.tap ? 0.82 : 1));
  return (
    <motion.div
      className="ghost-hand"
      initial={{ left: xs[0], top: ys[0], opacity: 0 }}
      animate={{ left: xs, top: ys, scale: scales, opacity: [0, ...steps.slice(1).map(() => 0.9)] }}
      transition={{ duration, ease: 'easeInOut' }}
      onAnimationComplete={onDone}
      aria-hidden="true"
    >
      <svg width="64" height="64" viewBox="0 0 64 64">
        <path
          d="M24 6c3 0 5 2 5 5v18l3-1c3-1 5 0 6 2l1 1 3-1c3-1 5 1 5 3l3-1c3 0 5 2 5 5v9c0 9-7 16-16 16h-4c-6 0-10-3-13-8l-8-13c-1-2 0-5 2-6 2-1 4 0 5 1l4 5V11c0-3 2-5 5-5z"
          fill="#ffffff"
          stroke="#7d8a96"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
