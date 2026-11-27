import { arc, dot, join, line, type Stroke } from './geometry';

/**
 * Handwriting templates. Every glyph is a list of strokes in teaching order and
 * direction (the way a child is taught to form it). Box: 100 x 120, y down.
 * Lowercase: ascender 10, x-height 50, baseline 90, descender 115.
 * Uppercase, digits and signs: top 10, baseline 90.
 */

export type GlyphKind = 'lower' | 'upper' | 'digit' | 'sign';

export interface Glyph {
  id: string;
  char: string;
  kind: GlyphKind;
  strokes: Stroke[];
  /** A picture anchor that helps remember the direction (emoji renders offline from system fonts). */
  anchor?: string;
}

const g = (id: string, char: string, kind: GlyphKind, strokes: Stroke[], anchor?: string): Glyph => ({
  id,
  char,
  kind,
  strokes,
  anchor,
});

const cShape = (cx = 50, cy = 70, r = 20) => arc(cx, cy, r, r, -35, -325);

export const GLYPHS: Record<string, Glyph> = Object.fromEntries(
  [
    // ---------- lowercase ----------
    g('a', 'a', 'lower', [cShape(48), line([68, 50], [68, 90])], '🍎'),
    g('b', 'b', 'lower', [line([30, 10], [30, 90]), arc(50, 70, 20, 20, 180, 540)], '🛏️'),
    g('c', 'c', 'lower', [cShape()], '🐱'),
    g('d', 'd', 'lower', [cShape(48), line([68, 10], [68, 90])], '🐶'),
    g('e', 'e', 'lower', [join(line([30, 70], [70, 70]), arc(50, 70, 20, 20, 0, -310))], '🥚'),
    g(
      'f',
      'f',
      'lower',
      [join(arc(56, 24, 14, 14, -20, -180), line([42, 24], [42, 90])), line([28, 50], [60, 50])],
      '🐟',
    ),
    g('g', 'g', 'lower', [cShape(48), join(line([68, 50], [68, 102]), arc(54, 102, 14, 12, 0, 160))], '🍇'),
    g(
      'h',
      'h',
      'lower',
      [
        line([30, 10], [30, 90]),
        join(line([30, 90], [30, 68]), arc(50, 68, 20, 18, 180, 360), line([70, 68], [70, 90])),
      ],
      '🏠',
    ),
    g('i', 'i', 'lower', [line([50, 50], [50, 90]), dot(50, 34)], '🍦'),
    g('j', 'j', 'lower', [join(line([60, 50], [60, 102]), arc(46, 102, 14, 12, 0, 160)), dot(60, 34)], '🧃'),
    g('k', 'k', 'lower', [line([30, 10], [30, 90]), line([66, 48], [30, 72], [68, 90])], '🪁'),
    g(
      'n',
      'n',
      'lower',
      [
        line([30, 50], [30, 90]),
        join(line([30, 90], [30, 68]), arc(50, 68, 20, 18, 180, 360), line([70, 68], [70, 90])),
      ],
      '👃',
    ),
    g('o', 'o', 'lower', [arc(50, 70, 20, 20, -90, -450)], '🍊'),
    g('p', 'p', 'lower', [line([30, 50], [30, 115]), arc(50, 70, 20, 20, 180, 540)], '🐷'),
    g('q', 'q', 'lower', [cShape(48), line([68, 50], [68, 115])], '👑'),
    g(
      'r',
      'r',
      'lower',
      [line([32, 50], [32, 90]), join(line([32, 90], [32, 70]), arc(50, 70, 18, 18, 180, 300))],
      '🐰',
    ),
    g('s', 's', 'lower', [join(arc(50, 60, 13, 10, -20, -270), arc(50, 80, 13, 10, -90, 160))], '🐍'),
    g('t', 't', 'lower', [line([45, 20], [45, 90]), line([30, 48], [62, 48])], '🌳'),
    g(
      'u',
      'u',
      'lower',
      [join(line([30, 50], [30, 70]), arc(50, 70, 20, 20, 180, 0), line([70, 70], [70, 50], [70, 90]))],
      '☂️',
    ),
    g('y', 'y', 'lower', [line([30, 50], [50, 88]), line([70, 50], [36, 115])], '🪀'),
    g('z', 'z', 'lower', [line([30, 50], [70, 50], [30, 90], [70, 90])], '🦓'),

    // ---------- uppercase ----------
    g(
      'B',
      'B',
      'upper',
      [
        line([30, 10], [30, 90]),
        join(
          line([30, 10], [52, 10]),
          arc(52, 30, 18, 20, -90, 90),
          line([52, 50], [30, 50], [56, 50]),
          arc(56, 70, 20, 20, -90, 90),
          line([56, 90], [30, 90]),
        ),
      ],
      '🦋',
    ),
    g('C', 'C', 'upper', [arc(54, 50, 34, 40, -40, -320)], '🌙'),
    g(
      'D',
      'D',
      'upper',
      [
        line([30, 10], [30, 90]),
        join(line([30, 10], [42, 10]), arc(42, 50, 34, 40, -90, 90), line([42, 90], [30, 90])),
      ],
      '🥁',
    ),
    g('E', 'E', 'upper', [line([68, 10], [30, 10], [30, 90], [68, 90]), line([30, 50], [60, 50])], '🐘'),
    g('F', 'F', 'upper', [line([68, 10], [30, 10], [30, 90]), line([30, 50], [60, 50])], '🐸'),
    g('G', 'G', 'upper', [join(arc(52, 50, 35, 40, -40, -360), line([87, 50], [60, 50]))], '🎸'),
    g('J', 'J', 'upper', [join(line([64, 10], [64, 70]), arc(46, 70, 18, 20, 0, 180))], '🤹'),
    g('K', 'K', 'upper', [line([30, 10], [30, 90]), line([70, 10], [30, 55], [72, 90])], '🦘'),
    g('L', 'L', 'upper', [line([30, 10], [30, 90], [70, 90])], '🦁'),
    g('N', 'N', 'upper', [line([30, 90], [30, 10], [70, 90], [70, 10])], '🪺'),
    g(
      'P',
      'P',
      'upper',
      [
        line([30, 10], [30, 90]),
        join(line([30, 10], [50, 10]), arc(50, 30, 20, 20, -90, 90), line([50, 50], [30, 50])),
      ],
      '🐧',
    ),
    g(
      'R',
      'R',
      'upper',
      [
        line([30, 10], [30, 90]),
        join(line([30, 10], [50, 10]), arc(50, 30, 20, 20, -90, 90), line([50, 50], [30, 50], [72, 90])),
      ],
      '🌈',
    ),
    g('S', 'S', 'upper', [join(arc(50, 30, 20, 20, -20, -270), arc(50, 70, 20, 20, -90, 160))], '☀️'),
    g('Z', 'Z', 'upper', [line([28, 10], [72, 10], [28, 90], [72, 90])], '⚡'),

    // ---------- digits ----------
    g('0', '0', 'digit', [arc(50, 50, 24, 40, -90, -450)]),
    g('1', '1', 'digit', [line([34, 26], [52, 10], [52, 90])]),
    g('2', '2', 'digit', [join(arc(50, 32, 22, 22, -160, 30), line([69, 43], [28, 90], [74, 90]))], '🦢'),
    g('3', '3', 'digit', [join(arc(50, 30, 20, 20, -150, 90), arc(50, 70, 20, 20, -90, 150))], '🥨'),
    g('4', '4', 'digit', [line([58, 10], [26, 64], [76, 64]), line([60, 40], [60, 90])], '⛵'),
    g('5', '5', 'digit', [line([70, 10], [36, 10], [33, 47]), arc(50, 67, 22, 22, -128, 150)], '🪝'),
    g('6', '6', 'digit', [join(line([66, 12], [44, 34], [30, 62]), arc(51, 68, 22, 22, 180, -180))], '🐌'),
    g('7', '7', 'digit', [line([28, 10], [72, 10], [40, 90])], '🪃'),
    g(
      '8',
      '8',
      'digit',
      [join(arc(50, 30, 18, 20, -30, -270), arc(50, 70, 22, 20, -90, 270), arc(50, 30, 18, 20, 90, -30))],
      '⛄',
    ),
    g('9', '9', 'digit', [join(arc(50, 32, 20, 22, -10, -370), line([70, 28], [68, 90]))], '🎈'),

    // ---------- signs ----------
    g('plus', '+', 'sign', [line([50, 25], [50, 75]), line([25, 50], [75, 50])]),
    g('minus', '-', 'sign', [line([25, 50], [75, 50])]),
    g('equals', '=', 'sign', [line([25, 40], [75, 40]), line([25, 62], [75, 62])]),
    g('question', '?', 'sign', [join(arc(50, 30, 20, 20, -160, 60), line([60, 47], [50, 58], [50, 68])), dot(50, 86)]),
    g('exclaim', '!', 'sign', [line([50, 10], [50, 66]), dot(50, 86)]),
  ].map((gl) => [gl.id, gl]),
);

/** Map a display character to its glyph id. */
export function glyphIdForChar(ch: string): string {
  const sign: Record<string, string> = { '+': 'plus', '-': 'minus', '=': 'equals', '?': 'question', '!': 'exclaim' };
  return sign[ch] ?? ch;
}

export function getGlyph(id: string): Glyph {
  const gl = GLYPHS[id];
  if (!gl) throw new Error(`Unknown glyph: ${id}`);
  return gl;
}

/** Glyphs whose mirror image is itself another real glyph. Pick rounds for these need a visible reference. */
export const AMBIGUOUS_MIRROR = new Set(['b', 'd', 'p', 'q']);
