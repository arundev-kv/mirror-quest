import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { audio } from '../../audio/engine';

interface Props {
  label: string;
  onClick: () => void;
  children: ReactNode;
  variant?: 'primary' | 'soft' | 'ghost';
  size?: number;
  disabled?: boolean;
  testId?: string;
}

/** Big, round, picture-only button. `label` is for screen readers and tests; kids see the icon. */
export function IconButton({ label, onClick, children, variant = 'soft', size = 72, disabled, testId }: Props) {
  return (
    <motion.button
      type="button"
      className={`icon-btn icon-btn--${variant}`}
      style={{ width: size, height: size }}
      aria-label={label}
      title={label}
      data-testid={testId}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      whileHover={{ y: -2 }}
      onClick={() => {
        audio.play('tap');
        onClick();
      }}
    >
      {children}
    </motion.button>
  );
}
