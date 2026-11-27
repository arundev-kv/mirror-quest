import { motion, useReducedMotion } from 'framer-motion';
import { Mascot } from '../components/Mascot';
import { IconButton } from '../components/IconButton';

/** Calm "see you tomorrow". There is deliberately no unlock, not even for parents. */
export function Sleep({ onBack }: { onBack: () => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="screen sleep" data-testid="sleep">
      <div className="night-sky">
        {[...Array(14)].map((_, i) => (
          <motion.span
            key={i}
            className="night-star"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 23) % 60}%` }}
            animate={reduce ? {} : { opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
        <div className="moon" />
      </div>
      <Mascot mood="sleep" size={160} />
      <motion.div
        className="zzz"
        animate={reduce ? {} : { y: [0, -14, 0], opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        z z z
      </motion.div>
      <p className="sleep-note">That's all for today. See you tomorrow!</p>
      <IconButton label="back to players" onClick={onBack} testId="sleep-back" variant="ghost">
        <svg width="32" height="32" viewBox="0 0 24 24">
          <path d="M15 5l-7 7 7 7" stroke="#e6e2f0" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      </IconButton>
    </div>
  );
}
