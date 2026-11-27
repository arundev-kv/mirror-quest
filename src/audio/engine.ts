import type { Theme } from '../core/levels';

/**
 * All music and sound effects are synthesised with the Web Audio API, so there are
 * no audio files to download or license and everything works offline.
 * Sounds are soft (sine/triangle, slow envelopes). There is no "fail" sound.
 */

export type Sfx = 'tap' | 'correct' | 'gentle' | 'star' | 'complete' | 'flip' | 'whoosh';

class AudioEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicTimer: number | null = null;
  private theme: Theme | null = null;
  private step = 0;
  private nextNoteTime = 0;
  private volumes = { music: 0.35, sfx: 0.6, muted: false };

  /** Must be called from a user gesture (browsers block autoplay). */
  unlock() {
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.applyVolumes();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.theme && this.musicTimer === null) this.startScheduler();
  }

  setVolumes(music: number, sfx: number, muted: boolean) {
    this.volumes = { music, sfx, muted };
    this.applyVolumes();
  }

  private applyVolumes() {
    if (!this.ctx || !this.musicGain || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(this.volumes.muted ? 0 : this.volumes.music * 0.25, t, 0.2);
    this.sfxGain.gain.setTargetAtTime(this.volumes.muted ? 0 : this.volumes.sfx * 0.5, t, 0.05);
  }

  /** Switch the generative background music to a theme (null stops it). */
  setMusic(theme: Theme | null) {
    if (this.theme?.id === theme?.id) return;
    this.theme = theme;
    this.step = 0;
    if (!theme) {
      this.stopScheduler();
      return;
    }
    if (this.ctx && this.musicTimer === null) this.startScheduler();
  }

  private startScheduler() {
    if (!this.ctx) return;
    this.nextNoteTime = this.ctx.currentTime + 0.3;
    this.musicTimer = window.setInterval(() => this.schedule(), 200);
  }

  private stopScheduler() {
    if (this.musicTimer !== null) window.clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  /** Slow pentatonic melody over a soft drone; a gentle, repetitive lullaby feel. */
  private schedule() {
    if (!this.ctx || !this.musicGain || !this.theme) return;
    const { root, bpm, scale } = this.theme.music;
    const beat = 60 / bpm;
    while (this.nextNoteTime < this.ctx.currentTime + 0.6) {
      const bar = Math.floor(this.step / 8);
      const pos = this.step % 8;
      if (pos === 0) {
        // Chord root every bar, cycling I - VI - IV - V-ish within the scale.
        const degrees = [0, 3, 2, 4];
        const deg = scale[degrees[bar % 4] % scale.length];
        this.tone(this.musicGain, (root / 2) * 2 ** (deg / 12), this.nextNoteTime, beat * 8, 'sine', 0.35);
      }
      // Sparse melody: play on some beats only, deterministic pattern.
      const pattern = [1, 0, 1, 0, 0, 1, 0, 0];
      if (pattern[pos]) {
        const idx = (bar * 3 + pos * 2) % scale.length;
        const octave = pos === 5 ? 2 : 1;
        this.tone(
          this.musicGain,
          root * octave * 2 ** (scale[idx] / 12),
          this.nextNoteTime,
          beat * 1.8,
          'triangle',
          0.18,
        );
      }
      this.nextNoteTime += beat / 2;
      this.step++;
    }
  }

  private tone(dest: AudioNode, freq: number, start: number, dur: number, type: OscillatorType, peak: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(peak, start + Math.min(0.08, dur / 4));
    env.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(env).connect(dest);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  play(sfx: Sfx) {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime + 0.01;
    const out = this.sfxGain;
    const n = (semi: number) => 523.25 * 2 ** (semi / 12); // around C5
    switch (sfx) {
      case 'tap':
        this.tone(out, n(7), t, 0.12, 'sine', 0.25);
        break;
      case 'correct':
        this.tone(out, n(0), t, 0.35, 'sine', 0.35);
        this.tone(out, n(4), t + 0.12, 0.35, 'sine', 0.35);
        this.tone(out, n(7), t + 0.24, 0.5, 'sine', 0.35);
        break;
      case 'gentle': // "let's try again", soft and warm, not a buzzer
        this.tone(out, n(-5), t, 0.35, 'sine', 0.25);
        this.tone(out, n(-3), t + 0.18, 0.45, 'sine', 0.22);
        break;
      case 'star':
        this.tone(out, n(12), t, 0.6, 'sine', 0.25);
        this.tone(out, n(19), t + 0.05, 0.6, 'sine', 0.15);
        break;
      case 'complete':
        [0, 4, 7, 12, 16].forEach((s, i) => this.tone(out, n(s), t + i * 0.14, 0.7, 'triangle', 0.25));
        break;
      case 'flip':
        this.tone(out, n(2), t, 0.15, 'sine', 0.2);
        this.tone(out, n(9), t + 0.1, 0.2, 'sine', 0.2);
        break;
      case 'whoosh':
        this.tone(out, n(-12), t, 0.3, 'sine', 0.12);
        break;
    }
  }
}

export const audio = new AudioEngine();
