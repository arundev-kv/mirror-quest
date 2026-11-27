/** 12 friendly animal avatars drawn in SVG (bundled, no images to download). */

interface AnimalSpec {
  face: string;
  ear: 'round' | 'pointy' | 'long' | 'none' | 'tuft';
  earColor?: string;
  muzzle?: string;
  beak?: boolean;
  patches?: boolean;
  mane?: string;
}

const SPECS: Record<string, AnimalSpec> = {
  cat: { face: '#e8c9a8', ear: 'pointy', muzzle: '#f5e6d6' },
  bear: { face: '#c9a586', ear: 'round', muzzle: '#e8d4bf' },
  bunny: { face: '#ece6e2', ear: 'long', earColor: '#e9c9cf', muzzle: '#faf6f3' },
  fox: { face: '#e3b48f', ear: 'pointy', muzzle: '#f7ece2' },
  owl: { face: '#c8b6a0', ear: 'tuft', beak: true },
  frog: { face: '#b9d3a8', ear: 'none', muzzle: '#d9e8cf' },
  panda: { face: '#f2f0ec', ear: 'round', earColor: '#5d5a5a', patches: true },
  lion: { face: '#e9cf9c', ear: 'round', mane: '#d1ab79', muzzle: '#f6e9cf' },
  mouse: { face: '#d4d0d4', ear: 'round', earColor: '#e8c9cf' },
  penguin: { face: '#6f7a8c', ear: 'none', muzzle: '#f3f1ec', beak: true },
  koala: { face: '#b9b8bd', ear: 'round', earColor: '#d6d4d9' },
  chick: { face: '#f1dd9c', ear: 'tuft', beak: true },
};

export function Avatar({ id, size = 96 }: { id: string; size?: number }) {
  const s = SPECS[id] ?? SPECS.cat;
  const ear = s.earColor ?? s.face;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={id}>
      {s.mane && <circle cx="50" cy="54" r="44" fill={s.mane} />}
      {s.ear === 'round' && (
        <>
          <circle cx="22" cy="26" r="13" fill={ear} />
          <circle cx="78" cy="26" r="13" fill={ear} />
        </>
      )}
      {s.ear === 'pointy' && (
        <>
          <path d="M14 40 L22 8 L42 26 Z" fill={ear} />
          <path d="M86 40 L78 8 L58 26 Z" fill={ear} />
        </>
      )}
      {s.ear === 'long' && (
        <>
          <ellipse cx="34" cy="18" rx="8" ry="20" fill={ear} stroke={s.face} strokeWidth="4" />
          <ellipse cx="66" cy="18" rx="8" ry="20" fill={ear} stroke={s.face} strokeWidth="4" />
        </>
      )}
      {s.ear === 'tuft' && (
        <>
          <path d="M26 30 L30 12 L42 26 Z" fill={s.face} />
          <path d="M74 30 L70 12 L58 26 Z" fill={s.face} />
        </>
      )}
      <circle cx="50" cy="56" r="36" fill={s.face} />
      {s.patches && (
        <>
          <ellipse cx="37" cy="52" rx="9" ry="11" fill="#5d5a5a" />
          <ellipse cx="63" cy="52" rx="9" ry="11" fill="#5d5a5a" />
        </>
      )}
      {s.muzzle && <ellipse cx="50" cy="68" rx="16" ry="11" fill={s.muzzle} />}
      <circle cx="38" cy="52" r="4.5" fill={s.patches ? '#f2f0ec' : '#3f3b3a'} />
      <circle cx="62" cy="52" r="4.5" fill={s.patches ? '#f2f0ec' : '#3f3b3a'} />
      <circle cx="39.5" cy="50.5" r="1.4" fill="#fff" />
      <circle cx="63.5" cy="50.5" r="1.4" fill="#fff" />
      {s.beak ? (
        <path d="M44 62 L56 62 L50 71 Z" fill="#e2b571" />
      ) : (
        <>
          <ellipse cx="50" cy="63" rx="4" ry="3" fill="#7b6460" />
          <path d="M44 69 Q50 74 56 69" stroke="#7b6460" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      )}
      <circle cx="30" cy="64" r="4" fill="#e9b9b4" opacity="0.5" />
      <circle cx="70" cy="64" r="4" fill="#e9b9b4" opacity="0.5" />
    </svg>
  );
}
