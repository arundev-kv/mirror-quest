import { motion, useReducedMotion } from 'framer-motion';

export type MascotMood = 'idle' | 'happy' | 'thinking' | 'sleep' | 'stretch';

/** "Pip", a soft round friend who guides the child. Moves slowly and calmly. */
export function Mascot({ mood = 'idle', size = 120 }: { mood?: MascotMood; size?: number }) {
  const reduce = useReducedMotion();
  const bob =
    reduce || mood === 'sleep'
      ? {}
      : mood === 'happy'
        ? { y: [0, -10, 0], transition: { duration: 0.9, repeat: 2 } }
        : mood === 'stretch'
          ? { scaleY: [1, 1.18, 1], scaleX: [1, 0.92, 1], transition: { duration: 2.4, repeat: Infinity } }
          : { y: [0, -3, 0], transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' as const } };
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      animate={bob}
      style={{ originY: 1 }}
      aria-hidden="true"
    >
      <ellipse cx="60" cy="112" rx="30" ry="5" fill="#000" opacity="0.08" />
      {mood === 'stretch' && (
        <>
          <path d="M28 60 Q14 30 22 14" stroke="#6cb95c" strokeWidth="9" strokeLinecap="round" fill="none" />
          <path d="M92 60 Q106 30 98 14" stroke="#6cb95c" strokeWidth="9" strokeLinecap="round" fill="none" />
        </>
      )}
      <path
        d="M60 18 C92 18 102 48 102 72 C102 98 84 108 60 108 C36 108 18 98 18 72 C18 48 28 18 60 18 Z"
        fill="#7cc46a"
      />
      <ellipse cx="60" cy="82" rx="26" ry="20" fill="#e4f5d8" />
      <path d="M60 18 Q58 6 66 4" stroke="#4f9d4a" strokeWidth="4" strokeLinecap="round" fill="none" />
      <ellipse cx="70" cy="6" rx="7" ry="4" fill="#9bd67c" transform="rotate(-20 70 6)" />
      {mood === 'sleep' ? (
        <>
          <path d="M40 58 Q46 63 52 58" stroke="#4d5b55" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M68 58 Q74 63 80 58" stroke="#4d5b55" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="46" cy="56" r="6" fill="#3f4a45" />
          <circle cx="74" cy="56" r="6" fill="#3f4a45" />
          <circle cx="48" cy="54" r="2" fill="#fff" />
          <circle cx="76" cy="54" r="2" fill="#fff" />
        </>
      )}
      {mood === 'happy' || mood === 'stretch' ? (
        <path d="M50 70 Q60 80 70 70" stroke="#4d5b55" strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : mood === 'thinking' ? (
        <circle cx="60" cy="72" r="3.5" fill="#4d5b55" />
      ) : (
        <path d="M53 71 Q60 75 67 71" stroke="#4d5b55" strokeWidth="3" fill="none" strokeLinecap="round" />
      )}
      <circle cx="36" cy="68" r="5" fill="#e9b9b4" opacity="0.55" />
      <circle cx="84" cy="68" r="5" fill="#e9b9b4" opacity="0.55" />
    </motion.svg>
  );
}
