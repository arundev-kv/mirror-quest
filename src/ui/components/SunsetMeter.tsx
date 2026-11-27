import { motion } from 'framer-motion';

/**
 * The 25-minute countdown as a sun slowly setting behind a hill.
 * fraction: 1 = just started the countdown, 0 = time to rest.
 */
export function SunsetMeter({ fraction }: { fraction: number }) {
  const y = 14 + (1 - fraction) * 34;
  return (
    <div className="sunset" role="img" aria-label="Play time is nearly over for today" data-testid="sunset">
      <svg width="120" height="64" viewBox="0 0 120 64">
        <defs>
          <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={fraction > 0.5 ? '#d9e6ef' : '#e8d9e6'} />
            <stop offset="1" stopColor="#f3e3cf" />
          </linearGradient>
        </defs>
        <rect width="120" height="64" rx="16" fill="url(#dusk)" />
        <motion.circle cx="60" r="12" fill="#efc982" animate={{ cy: y }} transition={{ duration: 1.5 }} />
        <path d="M0 50 Q30 38 60 46 T120 44 V64 H0 Z" fill="#b7cfa6" />
      </svg>
    </div>
  );
}
