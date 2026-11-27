/**
 * Spoken instructions using the browser's built-in speech synthesis (Web Speech API).
 * We prefer an American English voice that is installed on the device ("localService"),
 * so it works offline and sends nothing over the network.
 */

const PREFERRED = [
  'Samantha',
  'Allison',
  'Ava',
  'Microsoft Aria',
  'Microsoft Jenny',
  'Microsoft Zira',
  'Google US English',
];

let chosen: SpeechSynthesisVoice | null = null;
let enabled = true;
let volume = 1;

function supported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (!supported()) return null;
  const voices = window.speechSynthesis.getVoices();
  const us = voices.filter((v) => v.lang.replace('_', '-').toLowerCase() === 'en-us');
  // Local voices first: they work offline and don't send text anywhere.
  const local = us.filter((v) => v.localService);
  for (const pool of [local, us]) {
    for (const name of PREFERRED) {
      const v = pool.find((x) => x.name.includes(name));
      if (v) return v;
    }
    if (pool.length) return pool[0];
  }
  return null;
}

if (supported()) {
  chosen = pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', () => {
    chosen = pickVoice();
  });
}

export function setVoiceOptions(on: boolean, vol: number) {
  enabled = on;
  volume = Math.max(0, Math.min(1, vol));
  if (!on) stopSpeaking();
}

/** Remove emoji and symbols that would be read out oddly. */
export function cleanForSpeech(text: string): string {
  return text
    .replace(/✓/g, 'the tick')
    .replace(/↔/g, 'the flip button')
    .replace(/\p{Extended_Pictographic}️?/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function speak(text: string) {
  if (!supported() || !enabled || volume === 0 || !text) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(cleanForSpeech(text));
  chosen ??= pickVoice();
  if (chosen) u.voice = chosen;
  u.lang = 'en-US';
  u.rate = 0.9; // a little slower for young children
  u.pitch = 1.05;
  u.volume = volume;
  synth.speak(u);
}

export function stopSpeaking() {
  if (supported()) window.speechSynthesis.cancel();
}
