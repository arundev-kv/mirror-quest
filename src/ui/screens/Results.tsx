import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { audio } from '../../audio/engine';
import { getLevel, nextLevel } from '../../core/levels';
import { isLevelUnlocked } from '../../core/profiles';
import type { LevelResult } from '../../core/scoring';
import type { LevelProgress, Profile } from '../../core/types';
import { useUi } from '../../state/uiStore';
import { IconButton } from '../components/IconButton';
import { Mascot } from '../components/Mascot';
import { StarRow } from '../components/Stars';

export function Results({
  levelId,
  result,
  previous,
  profile,
}: {
  levelId: string;
  result: LevelResult;
  previous?: LevelProgress;
  profile: Profile;
}) {
  const go = useUi((s) => s.go);
  const level = getLevel(levelId)!;
  const next = nextLevel(levelId);
  const nextOpen = next ? isLevelUnlocked(profile, next.id) : false;
  const newBest = !previous || result.score > previous.bestScore;

  useEffect(() => {
    const timers = Array.from({ length: result.stars }, (_, i) =>
      window.setTimeout(() => audio.play('star'), 900 + i * 450),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [result.stars]);

  return (
    <div className="screen results" data-testid="results" data-score={result.score} data-stars={result.stars}>
      <motion.div className="results-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <Mascot mood="happy" size={130} />
        <StarRow stars={result.stars} size={64} animate />
        <motion.div className="score" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
          <span className="score-number" data-testid="score">
            {result.score}
          </span>
          {newBest && previous && (
            <span className="best-badge" aria-label="new best">
              ⬆
            </span>
          )}
        </motion.div>
        {!newBest && previous && (
          <div className="best-kept" data-testid="best-kept" aria-label="best score">
            <StarRow stars={previous.bestStars} size={22} /> <span>{previous.bestScore}</span>
          </div>
        )}
        <div className="results-actions">
          <IconButton label="map" onClick={() => go({ name: 'map' })} testId="results-map">
            <svg width="32" height="32" viewBox="0 0 24 24">
              <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="#8fa3b5" />
            </svg>
          </IconButton>
          <IconButton
            label="play again"
            onClick={() => go({ name: 'level', levelId: level.id, startedAtUsedMs: profile.usage.usedMs })}
            testId="results-retry"
          >
            <svg width="34" height="34" viewBox="0 0 24 24">
              <path
                d="M19 12a7 7 0 11-2.05-4.95"
                stroke="#8fa3b5"
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M19 4v5h-5"
                stroke="#8fa3b5"
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
          {next && nextOpen && (
            <IconButton
              label="next level"
              variant="primary"
              size={88}
              onClick={() => go({ name: 'level', levelId: next.id, startedAtUsedMs: profile.usage.usedMs })}
              testId="results-next"
            >
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
        </div>
      </motion.div>
    </div>
  );
}
