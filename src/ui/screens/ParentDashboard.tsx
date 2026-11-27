import { useRef, useState } from 'react';
import { getGlyph } from '../../core/glyphs';
import { LEVELS } from '../../core/levels';
import { isMastered } from '../../core/scoring';
import { topReversals, totalPoints } from '../../core/profiles';
import { parseImport, serializeExport } from '../../core/storage';
import { DAILY_LIMIT_MS, lastNDates, localDateKey, MINUTE, rollover } from '../../core/time';
import type { Profile } from '../../core/types';
import { useApp } from '../../state/appStore';
import { useUi } from '../../state/uiStore';
import { Avatar } from '../components/Avatar';
import { StarRow } from '../components/Stars';

function reversalLabel(key: string) {
  if (key === 'left-right') return 'Left / right';
  if (key === 'direction') return 'Which way';
  if (key === 'start') return 'Where to start';
  try {
    return getGlyph(key).char;
  } catch {
    return key;
  }
}

function MinutesChart({ profile, now }: { profile: Profile; now: number }) {
  const days = lastNDates(now, 14);
  const max = 30;
  return (
    <svg className="minutes-chart" viewBox="0 0 280 110" role="img" aria-label="Minutes played, last 14 days">
      <line x1="0" x2="280" y1="10" y2="10" stroke="#e5e1da" strokeDasharray="3 3" />
      <text x="278" y="8" fontSize="8" textAnchor="end" fill="#9a958d">
        30 min
      </text>
      {days.map((d, i) => {
        const v = Math.min(max, profile.history[d] ?? 0);
        const h = (v / max) * 80;
        return (
          <g key={d}>
            <rect x={i * 20 + 3} y={90 - h} width="14" height={h} rx="3" fill="#a9c6b3">
              <title>{`${d}: ${v} min`}</title>
            </rect>
            {(i % 3 === 0 || i === 13) && (
              <text x={i * 20 + 10} y="104" fontSize="7" textAnchor="middle" fill="#9a958d">
                {d.slice(5)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ProfileReport({ profile }: { profile: Profile }) {
  const deleteProfile = useApp((s) => s.deleteProfile);
  const [confirm, setConfirm] = useState(false);
  const [now] = useState(() => Date.now());
  const usage = rollover(profile.usage, now);
  const today = usage.date === localDateKey(now) ? usage.usedMs : 0;
  const reversals = topReversals(profile);
  return (
    <section className="report" data-testid={`report-${profile.name}`}>
      <header className="report-head">
        <Avatar id={profile.avatarId} size={56} />
        <div>
          <h3>{profile.name}</h3>
          <p>
            Age {profile.age} · {totalPoints(profile)} points · today {Math.round(today / MINUTE)} of{' '}
            {DAILY_LIMIT_MS / MINUTE} min
          </p>
        </div>
      </header>
      <table className="report-table">
        <thead>
          <tr>
            <th>Level</th>
            <th>Skill</th>
            <th>Best</th>
            <th>Stars</th>
            <th>Tries</th>
            <th title="Mastery criterion reached on two different days">Learned</th>
          </tr>
        </thead>
        <tbody>
          {LEVELS.map((l) => {
            const p = profile.levels[l.id];
            return (
              <tr key={l.id}>
                <td>{l.number}</td>
                <td>{l.skill}</td>
                <td>{p ? p.bestScore : '–'}</td>
                <td>{p ? <StarRow stars={p.bestStars} size={14} /> : '–'}</td>
                <td>{p?.attempts ?? 0}</td>
                <td>{isMastered(p) ? 'Yes' : p?.masteredOn.length ? '1 of 2 days' : '–'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="report-cols">
        <div>
          <h4>Most often reversed</h4>
          <p className="muted note-small">
            Reversals are normal until about age 7. Look at the trend over weeks, mostly in the memory-writing reviews
            (levels 10, 15, 20, 24 and 30). “Learned” means the level’s target was reached on two different days.
          </p>
          {reversals.length === 0 ? (
            <p className="muted">Nothing yet.</p>
          ) : (
            <ul className="reversal-list">
              {reversals.map(([k, n]) => (
                <li key={k}>
                  <span className="rev-char">{reversalLabel(k)}</span> {n}×
                </li>
              ))}
            </ul>
          )}
        </div>
        <div>
          <h4>Minutes played (14 days)</h4>
          <MinutesChart profile={profile} now={now} />
        </div>
      </div>
      <div className="report-actions">
        {!confirm ? (
          <button
            type="button"
            className="text-btn danger"
            onClick={() => setConfirm(true)}
            data-testid={`delete-${profile.name}`}
          >
            Delete profile
          </button>
        ) : (
          <>
            <span>Delete {profile.name} and all progress?</span>
            <button
              type="button"
              className="text-btn danger"
              onClick={() => deleteProfile(profile.id)}
              data-testid={`confirm-delete-${profile.name}`}
            >
              Yes, delete
            </button>
            <button type="button" className="text-btn" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export function ParentDashboard() {
  const go = useUi((s) => s.go);
  const profiles = useApp((s) => s.profiles);
  const settings = useApp((s) => s.settings);
  const updateSettings = useApp((s) => s.updateSettings);
  const importProfiles = useApp((s) => s.importProfiles);
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const exportAll = () => {
    const blob = new Blob([serializeExport(profiles, Date.now())], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mirror-quest-backup-${localDateKey(Date.now())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (file: File) => {
    try {
      const imported = parseImport(await file.text());
      importProfiles(imported);
      setMessage(`Imported ${imported.length} profile(s).`);
    } catch (e) {
      setMessage((e as Error).message);
    }
  };

  return (
    <div className="screen parent" data-testid="parent">
      <div className="parent-inner">
        <header className="parent-head">
          <h2>Grown-ups</h2>
          <button
            type="button"
            className="text-btn"
            onClick={() => go({ name: 'profiles' })}
            data-testid="parent-close"
          >
            Done
          </button>
        </header>

        <section className="report settings">
          <h3>Sound</h3>
          <label className="slider">
            Music
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.musicVolume}
              onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
            />
          </label>
          <label className="slider">
            Sound effects
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.sfxVolume}
              onChange={(e) => updateSettings({ sfxVolume: Number(e.target.value) })}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={settings.voice}
              onChange={(e) => updateSettings({ voice: e.target.checked })}
              data-testid="voice-toggle"
            />{' '}
            Read instructions aloud (American English voice)
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={settings.muted}
              onChange={(e) => updateSettings({ muted: e.target.checked })}
            />{' '}
            Mute everything
          </label>
          <p className="muted">
            Play time is limited to 30 minutes per child per day and resets at midnight. This limit can't be unlocked.
          </p>
        </section>

        <section className="report">
          <h3>Backup</h3>
          <p className="muted">
            All progress is stored only on this device. Export a backup file to move it to another browser.
          </p>
          <div className="report-actions">
            <button
              type="button"
              className="text-btn"
              onClick={exportAll}
              disabled={profiles.length === 0}
              data-testid="export"
            >
              Export progress
            </button>
            <button type="button" className="text-btn" onClick={() => fileRef.current?.click()} data-testid="import">
              Import progress
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              data-testid="import-file"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void onImport(f);
                e.target.value = '';
              }}
            />
          </div>
          {message && (
            <p className="muted" data-testid="import-message">
              {message}
            </p>
          )}
        </section>

        {profiles.length === 0 && <p className="muted">No players yet.</p>}
        {profiles.map((p) => (
          <ProfileReport key={p.id} profile={p} />
        ))}
      </div>
    </div>
  );
}
