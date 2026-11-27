import { motion } from 'framer-motion';
import { LEVELS, THEMES, WORLDS } from '../../core/levels';
import { currentWorld, lockReason, totalPoints } from '../../core/profiles';
import { isMastered } from '../../core/scoring';
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
  const mapWorld = useUi((s) => s.mapWorld);
  const setMapWorld = useUi((s) => s.setMapWorld);
  const world = mapWorld ?? currentWorld(profile);
  const levels = LEVELS.filter((l) => l.world === world);

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
      <nav className="world-chips" aria-label="worlds">
        {WORLDS.map((w) => {
          const first = LEVELS.find((l) => l.world === w.number)!;
          const open = lockReason(profile, first.id) === null || !!profile.levels[first.id];
          return (
            <button
              key={w.number}
              type="button"
              className={`world-chip ${w.number === world ? 'is-current' : ''} ${open ? '' : 'is-locked'}`}
              style={{ borderColor: THEMES[w.theme].accent }}
              data-testid={`world-${w.number}`}
              aria-label={`world ${w.number} ${w.name}${open ? '' : ' locked'}`}
              aria-pressed={w.number === world}
              onClick={() => setMapWorld(w.number)}
            >
              <span aria-hidden="true">{open ? first.icon : '🔒'}</span>
              <b>{w.number}</b>
            </button>
          );
        })}
      </nav>
      <div className="level-path">
        {levels.map((lvl, i) => {
          const reason = lockReason(profile, lvl.id);
          const unlocked = reason === null;
          const progress = profile.levels[lvl.id];
          const theme = THEMES[lvl.theme];
          return (
            <motion.div
              key={lvl.id}
              className="stone-wrap"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
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
                {isMastered(progress) && (
                  <span className="stone-mastered" title="learned on two days" aria-label="learned">
                    🌿
                  </span>
                )}
              </motion.button>
              <span className="stone-title">{lvl.title}</span>
              {reason === 'age' ? (
                <span className="stone-note">6+</span>
              ) : (
                <StarRow stars={progress?.bestStars ?? 0} size={24} />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
