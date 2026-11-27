import { describe, expect, it } from 'vitest';
import { transformStrokes, type Stroke } from '../geometry';
import { GLYPHS, getGlyph } from '../glyphs';
import { evaluateHandwriting } from '../recognizer';

/** Deterministic wobble so tests don't flake. */
function wobble(strokes: Stroke[], amount = 3, seed = 1): Stroke[] {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647 - 0.5;
  };
  return strokes.map((st) => st.map((p) => ({ x: p.x + rnd() * amount, y: p.y + rnd() * amount })));
}

/** Shrink and shift, like a child writing small in a corner. */
function shift(strokes: Stroke[], scale: number, dx: number, dy: number): Stroke[] {
  return strokes.map((st) => st.map((p) => ({ x: p.x * scale + dx, y: p.y * scale + dy })));
}

describe('evaluateHandwriting', () => {
  it.each(Object.keys(GLYPHS))('accepts a wobbly but correct "%s"', (id) => {
    const glyph = getGlyph(id);
    const r = evaluateHandwriting(wobble(glyph.strokes), glyph);
    expect(r.verdict).toBe('correct');
    expect(r.goodStart).toBe(true);
  });

  it('accepts a small, off-centre letter', () => {
    const glyph = getGlyph('b');
    expect(evaluateHandwriting(shift(wobble(glyph.strokes), 0.5, 30, 20), glyph).verdict).toBe('correct');
  });

  it.each(['b', 'd', 'p', 'q', '2', '3', '4', '5', '6', '7', '9', 'J', 'S', 'Z', 's', 'z', 'C', 'E', 'L', 'N'])(
    'flags a mirrored "%s"',
    (id) => {
      const glyph = getGlyph(id);
      const r = evaluateHandwriting(wobble(transformStrokes(glyph.strokes, 'flipX')), glyph);
      expect(r.verdict).toBe('mirrored');
    },
  );

  it('treats writing "d" when asked for "b" as mirrored', () => {
    expect(evaluateHandwriting(getGlyph('d').strokes, getGlyph('b')).verdict).toBe('mirrored');
  });

  it('flags upside-down "b" (a "p") as flipped', () => {
    expect(evaluateHandwriting(getGlyph('p').strokes, getGlyph('b')).verdict).toBe('flipped');
  });

  it.each(['o', '0', '8', 'plus', 'equals', 'minus'])('never calls symmetric "%s" mirrored', (id) => {
    const glyph = getGlyph(id);
    const r = evaluateHandwriting(transformStrokes(glyph.strokes, 'flipX'), glyph);
    expect(r.verdict).toBe('correct');
  });

  it('asks to retry for a different shape', () => {
    expect(evaluateHandwriting(getGlyph('L').strokes, getGlyph('b')).verdict).toBe('retry');
    expect(evaluateHandwriting(getGlyph('7').strokes, getGlyph('S')).verdict).toBe('retry');
  });

  it('reports an empty drawing', () => {
    expect(evaluateHandwriting([], getGlyph('b')).verdict).toBe('empty');
    expect(evaluateHandwriting([[{ x: 1, y: 1 }]], getGlyph('b')).verdict).toBe('empty');
  });

  it('notices a backwards start', () => {
    const glyph = getGlyph('b');
    const reversed = glyph.strokes.map((s) => [...s].reverse()).reverse();
    expect(evaluateHandwriting(reversed, glyph).goodStart).toBe(false);
  });
});

describe('scribbles', () => {
  it('asks to retry for a zig-zag scribble', () => {
    const zig: Stroke = Array.from({ length: 30 }, (_, i) => ({ x: 20 + (i % 2) * 60, y: 10 + i * 3 }));
    expect(evaluateHandwriting([zig], getGlyph('b')).verdict).toBe('retry');
  });
});
