import { AnimatePresence, MotionConfig } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { audio } from './audio/engine';
import { setVoiceOptions } from './audio/voice';
import { getLevel, THEMES, WORLDS, type ThemeId } from './core/levels';
import { currentWorld } from './core/profiles';
import { countdownFraction, DAILY_LIMIT_MS, limitPhase } from './core/time';
import { useActiveProfile, useApp } from './state/appStore';
import { useUi } from './state/uiStore';
import { SunsetMeter } from './ui/components/SunsetMeter';
import { usePlayClock } from './ui/hooks/usePlayClock';
import { BreakOverlay } from './ui/screens/BreakOverlay';
import { CreateProfile } from './ui/screens/CreateProfile';
import { LevelMap } from './ui/screens/LevelMap';
import { LevelPlayer } from './ui/screens/LevelPlayer';
import { ParentDashboard } from './ui/screens/ParentDashboard';
import { ParentGate } from './ui/screens/ParentGate';
import { ProfilePicker } from './ui/screens/ProfilePicker';
import { Results } from './ui/screens/Results';
import { Sleep } from './ui/screens/Sleep';

// three.js is large: load the 3D backdrop separately so the first screen appears quickly.
const ThemeScene = lazy(() => import('./scenes/ThemeScene'));

export default function App() {
  usePlayClock();
  const screen = useUi((s) => s.screen);
  const go = useUi((s) => s.go);
  const navId = useUi((s) => s.navId);
  const breakDue = useUi((s) => s.breakDue);
  const setBreakDue = useUi((s) => s.setBreakDue);
  const mapWorld = useUi((s) => s.mapWorld);
  const settings = useApp((s) => s.settings);
  const selectProfile = useApp((s) => s.selectProfile);
  const profile = useActiveProfile();

  // Audio can only start after a user gesture.
  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener('pointerdown', unlock);
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);
  useEffect(() => {
    audio.setVolumes(settings.musicVolume, settings.sfxVolume, settings.muted);
    setVoiceOptions(settings.voice && !settings.muted, Math.max(0.6, settings.sfxVolume));
  }, [settings]);

  // Which screen needs a profile, and is today's time used up?
  const needsProfile = screen.name === 'map' || screen.name === 'level' || screen.name === 'results';
  const usedMs = profile?.usage.usedMs ?? 0;
  const levelRunning =
    (screen.name === 'level' && screen.startedAtUsedMs < DAILY_LIMIT_MS) || screen.name === 'results';
  const phase = limitPhase(usedMs, levelRunning);
  const locked = needsProfile && !!profile && phase === 'locked';

  const theme: ThemeId | null =
    screen.name === 'parent' || screen.name === 'parentGate' || locked
      ? null
      : screen.name === 'level' || screen.name === 'results'
        ? (getLevel(screen.levelId)?.theme ?? 'meadow')
        : screen.name === 'map' && profile
          ? WORLDS[(mapWorld ?? currentWorld(profile)) - 1].theme
          : 'meadow';

  useEffect(() => {
    audio.setMusic(theme && !locked ? THEMES[theme] : null);
  }, [theme, locked]);

  useEffect(() => {
    if (needsProfile && !profile) go({ name: 'profiles' });
  }, [needsProfile, profile, go]);

  const backToProfiles = () => {
    selectProfile(null);
    go({ name: 'profiles' });
  };

  let content;
  if (locked) {
    content = <Sleep onBack={backToProfiles} />;
  } else {
    switch (screen.name) {
      case 'profiles':
        content = <ProfilePicker />;
        break;
      case 'create':
        content = <CreateProfile />;
        break;
      case 'map':
        content = profile && <LevelMap profile={profile} />;
        break;
      case 'level':
        content = profile && <LevelPlayer key={navId} levelId={screen.levelId} profile={profile} />;
        break;
      case 'results':
        content = profile && (
          <Results levelId={screen.levelId} result={screen.result} previous={screen.previous} profile={profile} />
        );
        break;
      case 'parentGate':
        content = <ParentGate />;
        break;
      case 'parent':
        content = <ParentDashboard />;
        break;
    }
  }

  const showSunset = needsProfile && !locked && (phase === 'countdown' || phase === 'grace');
  const showBreak = breakDue && !locked && (screen.name === 'map' || screen.name === 'results');

  return (
    <MotionConfig reducedMotion="user">
      <div className={`app ${locked ? 'is-night' : ''}`}>
        {theme && (
          <Suspense fallback={<div className="scene-bg" style={{ background: THEMES[theme].sky }} />}>
            <ThemeScene theme={theme} />
          </Suspense>
        )}
        <div className="app-content">{content}</div>
        {showSunset && <SunsetMeter fraction={countdownFraction(usedMs)} />}
        <AnimatePresence>{showBreak && <BreakOverlay onDone={() => setBreakDue(false)} />}</AnimatePresence>
      </div>
    </MotionConfig>
  );
}
