import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useUi } from '../../state/uiStore';
import { IconButton } from '../components/IconButton';

const HOLD_MS = 3000;

/** Adult gate: hold for 3 seconds, then solve a sum. Keeps little fingers out of settings. */
export function ParentGate() {
  const go = useUi((s) => s.go);
  const [held, setHeld] = useState(false);
  const [holding, setHolding] = useState(false);
  const [wrong, setWrong] = useState(false);
  const timer = useRef<number | null>(null);
  const [{ a, b, choices }] = useState(() => {
    const a = 5 + Math.floor(Math.random() * 5);
    const b = 3 + Math.floor(Math.random() * 7);
    const s = a + b;
    const opts = new Set([s, s + 2, s - 3, s + 5]);
    return { a, b, choices: [...opts].sort(() => Math.random() - 0.5) };
  });

  const start = () => {
    setHolding(true);
    timer.current = window.setTimeout(() => setHeld(true), HOLD_MS);
  };
  const stop = () => {
    setHolding(false);
    if (timer.current) window.clearTimeout(timer.current);
  };

  return (
    <div className="screen gate" data-testid="parent-gate">
      <div className="gate-card">
        <h2>For grown-ups</h2>
        {!held ? (
          <>
            <p>Press and hold for 3 seconds.</p>
            <button
              type="button"
              className="hold-btn"
              data-testid="gate-hold"
              onPointerDown={start}
              onPointerUp={stop}
              onPointerLeave={stop}
              onPointerCancel={stop}
            >
              <motion.span
                className="hold-fill"
                animate={{ width: holding ? '100%' : '0%' }}
                transition={{ duration: holding ? HOLD_MS / 1000 : 0.2, ease: 'linear' }}
              />
              <span className="hold-label">Hold</span>
            </button>
          </>
        ) : (
          <>
            <p>
              What is {a} + {b}?
            </p>
            <div className="gate-choices">
              {choices.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="gate-choice"
                  data-testid={`gate-answer-${c}`}
                  onClick={() => (c === a + b ? go({ name: 'parent' }) : setWrong(true))}
                >
                  {c}
                </button>
              ))}
            </div>
            {wrong && <p className="gate-wrong">Not quite, try again.</p>}
          </>
        )}
        <IconButton label="back" onClick={() => go({ name: 'profiles' })} testId="gate-back" size={56}>
          <svg width="28" height="28" viewBox="0 0 24 24">
            <path d="M15 5l-7 7 7 7" stroke="#8fa3b5" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}
