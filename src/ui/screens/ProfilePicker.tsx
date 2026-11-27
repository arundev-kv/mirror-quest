import { motion } from 'framer-motion';
import { totalStars } from '../../core/profiles';
import { useApp } from '../../state/appStore';
import { useUi } from '../../state/uiStore';
import { Avatar } from '../components/Avatar';
import { IconButton } from '../components/IconButton';
import { Mascot } from '../components/Mascot';
import { Star } from '../components/Stars';

export function ProfilePicker() {
  const profiles = useApp((s) => s.profiles);
  const selectProfile = useApp((s) => s.selectProfile);
  const go = useUi((s) => s.go);

  return (
    <div className="screen profiles" data-testid="profiles">
      <div className="title-row">
        <Mascot size={110} />
        <h1 className="app-title">Mirror Quest</h1>
      </div>
      <div className="profile-grid">
        {profiles.map((p, i) => (
          <motion.button
            key={p.id}
            type="button"
            className="profile-card"
            data-testid={`profile-${p.name}`}
            aria-label={p.name}
            onClick={() => {
              selectProfile(p.id);
              go({ name: 'map' });
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar id={p.avatarId} size={110} />
            <span className="profile-name">{p.name}</span>
            <span className="profile-stars">
              <Star filled size={22} /> {totalStars(p)}
            </span>
          </motion.button>
        ))}
        <motion.button
          type="button"
          className="profile-card add"
          data-testid="add-profile"
          aria-label="add a player"
          onClick={() => go({ name: 'create' })}
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="80" height="80" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" stroke="#8fa3b5" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </motion.button>
      </div>
      <div className="corner-btn">
        <IconButton
          label="grown-ups"
          onClick={() => go({ name: 'parentGate' })}
          testId="parent-btn"
          size={56}
          variant="ghost"
        >
          <svg width="28" height="28" viewBox="0 0 24 24">
            <path d="M7 11V8a5 5 0 0110 0v3" stroke="#8fa3b5" strokeWidth="2" fill="none" />
            <rect x="5" y="11" width="14" height="10" rx="2" fill="#8fa3b5" />
          </svg>
        </IconButton>
      </div>
    </div>
  );
}
