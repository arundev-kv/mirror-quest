import { motion } from 'framer-motion';

export function Star({ filled, size = 40 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1 6.1 20.3l1.3-6.5L2.5 9.3l6.6-.8z"
        fill={filled ? '#f2c14e' : '#e6e2da'}
        stroke={filled ? '#d9a521' : '#d4cfc5'}
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Stars appear one by one, softly. No flashing or pulsing. */
export function StarRow({ stars, size = 40, animate = false }: { stars: number; size?: number; animate?: boolean }) {
  return (
    <div className="star-row" aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <motion.span
          key={i}
          initial={animate ? { opacity: 0, scale: 0.6, y: 10 } : false}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: animate ? 0.4 + i * 0.45 : 0, duration: 0.5 }}
        >
          <Star filled={i <= stars} size={size} />
        </motion.span>
      ))}
    </div>
  );
}
