import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Mascot } from '../components/Mascot';
import { IconButton } from '../components/IconButton';

/** Suggested stretch break every 10 minutes. Kids copy Pip's stretch; can continue after a few seconds. */
export function BreakOverlay({ onDone }: { onDone: () => void }) {
  const [canSkip, setCanSkip] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setCanSkip(true), 6000);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <motion.div
      className="overlay break"
      data-testid="break"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Mascot mood="stretch" size={200} />
      <div className="break-arrows" aria-hidden="true">
        ⬆ ⬆
      </div>
      {canSkip && (
        <IconButton label="continue" variant="primary" size={88} onClick={onDone} testId="break-done">
          <svg width="40" height="40" viewBox="0 0 24 24">
            <path
              d="M9 5l7 7-7 7"
              stroke="#fff"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </IconButton>
      )}
    </motion.div>
  );
}
