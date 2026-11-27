import { AnimatePresence, motion } from 'framer-motion';
import { SIDE_WORD, type Segment } from '../copy';
import { SIDE_COLORS } from './sideColors';

/** The written instruction for the current round, with LEFT / RIGHT coloured. */
export function Instruction({
  segments,
  hint,
  feedback,
  onReplay,
}: {
  segments: Segment[];
  hint?: string | null;
  feedback?: string | null;
  onReplay?: () => void;
}) {
  return (
    <div className="instruction" data-testid="instruction" aria-live="polite">
      <p
        className="instruction-text"
        onClick={onReplay}
        title="Tap to hear it again"
        style={{ cursor: onReplay ? 'pointer' : undefined }}
      >
        {segments.map((s, i) =>
          typeof s === 'string' ? (
            <span key={i}>{s}</span>
          ) : (
            <strong key={i} className="side-word" style={{ color: SIDE_COLORS[s.side] }}>
              {SIDE_WORD[s.side]}
            </strong>
          ),
        )}
      </p>
      <AnimatePresence mode="wait">
        {feedback ? (
          <motion.p
            key={feedback}
            className="instruction-feedback"
            data-testid="feedback-text"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {feedback}
          </motion.p>
        ) : hint ? (
          <motion.p
            key="hint"
            className="instruction-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {hint}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
