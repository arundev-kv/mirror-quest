/**
 * Pure geometry helpers shared by glyph templates and the handwriting recognizer.
 * Coordinates live in a 100 x 120 "glyph box" with y pointing down (screen space).
 */

export interface Point {
  x: number;
  y: number;
}

export type Stroke = Point[];

export const GLYPH_BOX = { width: 100, height: 120 } as const;

const DEG = Math.PI / 180;

/** Straight polyline through the given points (each segment subdivided for smooth resampling). */
export function line(...pts: [number, number][]): Stroke {
  const out: Stroke = [];
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i];
    if (i > 0) {
      const [px, py] = pts[i - 1];
      const steps = Math.max(2, Math.ceil(Math.hypot(x - px, y - py) / 4));
      for (let s = 1; s < steps; s++) {
        const t = s / steps;
        out.push({ x: px + (x - px) * t, y: py + (y - py) * t });
      }
    }
    out.push({ x, y });
  }
  return out;
}

/**
 * Elliptical arc. Angles in degrees, 0 = right, 90 = down (screen space).
 * Increasing angles run clockwise on screen, decreasing run counter-clockwise.
 */
export function arc(cx: number, cy: number, rx: number, ry: number, fromDeg: number, toDeg: number): Stroke {
  const span = Math.abs(toDeg - fromDeg);
  const steps = Math.max(6, Math.ceil(span / 8));
  const out: Stroke = [];
  for (let i = 0; i <= steps; i++) {
    const a = (fromDeg + ((toDeg - fromDeg) * i) / steps) * DEG;
    out.push({ x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) });
  }
  return out;
}

/** Join several path pieces into one continuous stroke. */
export function join(...parts: Stroke[]): Stroke {
  return parts.flat();
}

/** A dot written as a tiny stroke. */
export function dot(x: number, y: number): Stroke {
  return [
    { x, y },
    { x: x + 0.5, y: y + 0.5 },
  ];
}

export function pathLength(stroke: Stroke): number {
  let len = 0;
  for (let i = 1; i < stroke.length; i++) {
    len += Math.hypot(stroke[i].x - stroke[i - 1].x, stroke[i].y - stroke[i - 1].y);
  }
  return len;
}

export function boundingBox(points: Point[]) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

export type Transform = 'identity' | 'flipX' | 'flipY' | 'rotate180';

export const TRANSFORMS: Transform[] = ['identity', 'flipX', 'flipY', 'rotate180'];

/** Apply a mirror/rotation transform around the centre of the glyph box. */
export function transformStrokes(strokes: Stroke[], t: Transform): Stroke[] {
  if (t === 'identity') return strokes;
  const cx = GLYPH_BOX.width / 2;
  const cy = GLYPH_BOX.height / 2;
  const fx = t === 'flipX' || t === 'rotate180';
  const fy = t === 'flipY' || t === 'rotate180';
  return strokes.map((s) => s.map((p) => ({ x: fx ? 2 * cx - p.x : p.x, y: fy ? 2 * cy - p.y : p.y })));
}

/** SVG path data for a set of strokes. */
export function strokesToPath(strokes: Stroke[]): string {
  return strokes
    .map((s) => s.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' '))
    .join(' ');
}
