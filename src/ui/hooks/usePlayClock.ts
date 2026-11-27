import { useEffect } from 'react';
import { crossedBreak, isActive } from '../../core/time';
import { useApp } from '../../state/appStore';
import { useUi } from '../../state/uiStore';

/** Screens where play time counts. */
const COUNTING = new Set(['map', 'level', 'results']);

/**
 * Counts ACTIVE play time once per second: the tab must be visible and the child
 * must have touched / moved / typed in the last 60 seconds.
 */
export function usePlayClock() {
  useEffect(() => {
    let lastInput = Date.now();
    const onInput = () => {
      lastInput = Date.now();
    };
    const events = ['pointerdown', 'pointermove', 'keydown', 'wheel'] as const;
    events.forEach((e) => window.addEventListener(e, onInput, { passive: true }));

    const id = window.setInterval(() => {
      const app = useApp.getState();
      const ui = useUi.getState();
      const profile = app.profiles.find((p) => p.id === app.activeProfileId);
      if (!profile) return;
      const now = Date.now();
      const active =
        COUNTING.has(ui.screen.name) &&
        isActive({ visible: document.visibilityState === 'visible', lastInputMs: lastInput, nowMs: now });
      const before = profile.usage.usedMs;
      app.tick(now, active ? 1000 : 0);
      const after = useApp.getState().profiles.find((p) => p.id === profile.id)?.usage.usedMs ?? before;
      if (crossedBreak(before, after)) ui.setBreakDue(true);
    }, 1000);

    return () => {
      window.clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, onInput));
    };
  }, []);
}
