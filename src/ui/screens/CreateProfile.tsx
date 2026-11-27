import { useState } from 'react';
import { AVATAR_IDS, MAX_NAME_LENGTH } from '../../core/profiles';
import type { Age } from '../../core/types';
import { useApp } from '../../state/appStore';
import { useUi } from '../../state/uiStore';
import { Avatar } from '../components/Avatar';
import { IconButton } from '../components/IconButton';

/** Usually filled in by a grown-up (kids can't type yet); picking the avatar is the fun part for the child. */
export function CreateProfile() {
  const addProfile = useApp((s) => s.addProfile);
  const selectProfile = useApp((s) => s.selectProfile);
  const go = useUi((s) => s.go);
  const [name, setName] = useState('');
  const [age, setAge] = useState<Age | null>(null);
  const [avatar, setAvatar] = useState<string>(AVATAR_IDS[0]);
  const ready = name.trim().length > 0 && age !== null;

  return (
    <div className="screen create" data-testid="create">
      <div className="create-card">
        <div className="create-preview">
          <Avatar id={avatar} size={120} />
        </div>
        <label className="field">
          <span className="field-label">Name</span>
          <input
            data-testid="name-input"
            value={name}
            maxLength={MAX_NAME_LENGTH}
            onChange={(e) => setName(e.target.value)}
            placeholder="Child's name"
            autoComplete="off"
          />
        </label>
        <div className="field">
          <span className="field-label">Age</span>
          <div className="age-row">
            {([3, 4, 5, 6] as Age[]).map((a) => (
              <button
                key={a}
                type="button"
                className={`age-btn ${age === a ? 'is-on' : ''}`}
                data-testid={`age-${a}`}
                onClick={() => setAge(a)}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
        <div className="avatar-grid" role="radiogroup" aria-label="avatar">
          {AVATAR_IDS.map((id) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={avatar === id}
              aria-label={id}
              data-testid={`avatar-${id}`}
              className={`avatar-btn ${avatar === id ? 'is-on' : ''}`}
              onClick={() => setAvatar(id)}
            >
              <Avatar id={id} size={64} />
            </button>
          ))}
        </div>
        <div className="create-actions">
          <IconButton label="cancel" onClick={() => go({ name: 'profiles' })} testId="create-cancel">
            <svg width="32" height="32" viewBox="0 0 24 24">
              <path d="M15 5l-7 7 7 7" stroke="#8fa3b5" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </svg>
          </IconButton>
          <IconButton
            label="save"
            variant="primary"
            size={88}
            disabled={!ready}
            testId="create-save"
            onClick={() => {
              const p = addProfile({ name, age: age!, avatarId: avatar });
              selectProfile(p.id);
              go({ name: 'map' });
            }}
          >
            <svg width="44" height="44" viewBox="0 0 24 24">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="#fff"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
        </div>
      </div>
    </div>
  );
}
