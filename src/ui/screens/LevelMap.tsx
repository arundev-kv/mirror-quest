import { motion } from 'framer-motion';
import { LEVELS, THEMES } from '../../core/levels';
import { isLevelUnlocked, totalPoints } from '../../core/profiles';
import type { Profile } from '../../core/types';
import { useApp } from '../../state/appStore';
import { useUi } from '../../state/uiStore';
import { Avatar } from '../components/Avatar';
import { IconButton } from '../components/IconButton';
import { StarRow } from '../components/Stars';

export function LevelMap({ profile }: { profile: Profile }) {
  const go = useUi((s) => s.go);
  const selectProfile = useApp((s) => s.selectProfile);
  const usedMs = profile.usage.usedMs;

  return (
    <div className="screen map" data-testid="map">
      <header className="map-bar">
        <IconButton
          label="change player"
          onClick={() => {
            selectProfile(null);
            go({ name: 'profiles' });
          }}
          testId="map-profiles"
          size={64}
        >
          <Avatar id={profile.avatarId} size={52} />
        </IconButton>
        <div className="points" data-testid="points" aria-label={`${totalPoints(profile)} points`}>
          <svg width="28" height="28" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9.5" fill="#e7c873" stroke="#d2b05a" />
            <circle cx="12" cy="12" r="5" fill="none" stroke="#fff6dc" strokeWidth="1.8" />
          </svg>
          <span>{totalPoints(profile)}</span>
        </div>
      </header>
      <div className="level-path">
        {LEVELS.map((lvl, i) => {
          const unlocked = isLevelUnlocked(profile, lvl.id);
          const progress = profile.levels[lvl.id];
          const theme = THEMES[lvl.theme];
          return (
            <motion.div
              key={lvl.id}
              className="stone-wrap"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.12 }}
            >
              <motion.button
                type="button"
                className={`stone ${unlocked ? '' : 'is-locked'}`}
                style={{ background: unlocked ? theme.ground : '#ddd9d3', borderColor: theme.accent }}
                data-testid={`level-${lvl.number}`}
                data-unlocked={unlocked}
                aria-label={`level ${lvl.number}${unlocked ? '' : ' locked'}`}
                disabled={!unlocked}
                whileHover={unlocked ? { y: -6 } : {}}
                whileTap={unlocked ? { scale: 0.94 } : {}}
                onClick={() => go({ name: 'level', levelId: lvl.id, startedAtUsedMs: usedMs })}
              >
                <span className="stone-icon">{unlocked ? lvl.icon : '🔒'}</span>
                <span className="stone-number">{lvl.number}</span>
              </motion.button>
              <span className="stone-title">{lvl.title}</span>
              <StarRow stars={progress?.bestStars ?? 0} size={26} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
