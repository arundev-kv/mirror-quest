import {
  boundingBox,
  pathLength,
  transformStrokes,
  TRANSFORMS,
  type Point,
  type Stroke,
  type Transform,
} from './geometry';
import type { Glyph } from './glyphs';

/**
 * Offline handwriting check, based on the $P point-cloud recognizer
 * (Vatavu, Anthony & Wobbrock 2012) with two additions for this game:
 *  1. The child's drawing is compared with the template AND its mirrored /
 *     flipped variants, so we can tell "mirrored" apart from "not quite right".
 *  2. The start point and starting direction are checked, because forming a
 *     letter from the right place is what prevents reversals.
 */

const N = 48;

export type HandwritingVerdict = 'correct' | 'mirrored' | 'flipped' | 'retry' | 'empty';

export interface HandwritingResult {
  verdict: HandwritingVerdict;
  /** 0..1 shape quality for the expected orientation. */
  quality: number;
  /** True when the child started near the template's start point and moved the right way. */
  goodStart: boolean;
  /** Which transform of the template matched best. */
  bestTransform: Transform;
  distances: Record<Transform, number>;
}

function resample(points: Point[], n: number): Point[] {
  const total = pathLengthMulti(points);
  if (points.length === 0) return [];
  if (total === 0) return Array.from({ length: n }, () => ({ ...points[0] }));
  const interval = total / (n - 1);
  const pts = points.map((p) => ({ ...p }));
  const out: Point[] = [{ ...pts[0] }];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (acc + d >= interval && d > 0) {
      const t = (interval - acc) / d;
      const q = { x: pts[i - 1].x + t * (pts[i].x - pts[i - 1].x), y: pts[i - 1].y + t * (pts[i].y - pts[i - 1].y) };
      out.push(q);
      pts.splice(i, 0, q);
      acc = 0;
    } else {
      acc += d;
    }
  }
  while (out.length < n) out.push({ ...pts[pts.length - 1] });
  return out.slice(0, n);
}

function pathLengthMulti(points: Point[]): number {
  return pathLength(points);
}

/**
 * Turn strokes into a normalised cloud. Strokes are resampled proportionally
 * to their length so dots don't dominate. Scale is uniform, so mirroring survives.
 */
interface CloudPoint extends Point {
  /** Undirected stroke orientation as (cos 2θ, sin 2θ): stroke direction doesn't matter, mirroring does. */
  ox: number;
  oy: number;
}

const ORIENTATION_WEIGHT = 0.12;

function toCloud(strokes: Stroke[]): CloudPoint[] {
  const nonEmpty = strokes.filter((s) => s.length > 0);
  const lengths = nonEmpty.map((s) => Math.max(pathLength(s), 2));
  const total = lengths.reduce((a, b) => a + b, 0);
  let cloud: Point[] = [];
  const orient: { ox: number; oy: number }[] = [];
  nonEmpty.forEach((s, i) => {
    const count = Math.max(2, Math.round((lengths[i] / total) * N));
    const pts = resample(s, count);
    pts.forEach((_p, j) => {
      const a = pts[Math.max(0, j - 1)];
      const b = pts[Math.min(pts.length - 1, j + 1)];
      const theta = Math.atan2(b.y - a.y, b.x - a.x);
      const moving = Math.hypot(b.x - a.x, b.y - a.y) > 0.01;
      orient.push(moving ? { ox: Math.cos(2 * theta), oy: Math.sin(2 * theta) } : { ox: 0, oy: 0 });
    });
    cloud = cloud.concat(pts);
  });
  const bb = boundingBox(cloud);
  const size = Math.max(bb.width, bb.height, 1);
  const cx = cloud.reduce((a, p) => a + p.x, 0) / cloud.length;
  const cy = cloud.reduce((a, p) => a + p.y, 0) / cloud.length;
  return cloud.map((p, i) => ({ x: (p.x - cx) / size, y: (p.y - cy) / size, ...orient[i] }));
}

/** Symmetric average nearest-neighbour distance between two clouds. */
function cloudDistance(a: CloudPoint[], b: CloudPoint[]): number {
  const w2 = ORIENTATION_WEIGHT * ORIENTATION_WEIGHT;
  const oneWay = (from: CloudPoint[], to: CloudPoint[]) => {
    let sum = 0;
    for (const p of from) {
      let best = Infinity;
      for (const q of to) {
        const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + w2 * ((p.ox - q.ox) ** 2 + (p.oy - q.oy) ** 2);
        if (d < best) best = d;
      }
      sum += Math.sqrt(best);
    }
    return sum / from.length;
  };
  return (oneWay(a, b) + oneWay(b, a)) / 2;
}

/** Below this the drawing is the right shape. Tuned with the tests in recognizer.test.ts. */
export const MATCH_THRESHOLD = 0.1;
/** A transform must beat identity by this ratio to count as a reversal. */
const REVERSAL_MARGIN = 0.8;

export function evaluateHandwriting(strokes: Stroke[], glyph: Glyph): HandwritingResult {
  const ink = strokes.filter((s) => s.length > 0);
  const inkLength = ink.reduce((a, s) => a + pathLength(s), 0);
  const empty: Record<Transform, number> = { identity: 1, flipX: 1, flipY: 1, rotate180: 1 };
  if (ink.length === 0 || inkLength < 15) {
    return { verdict: 'empty', quality: 0, goodStart: false, bestTransform: 'identity', distances: empty };
  }

  const kid = toCloud(ink);
  const distances = { ...empty };
  const templateClouds: Partial<Record<Transform, CloudPoint[]>> = {};
  for (const t of TRANSFORMS) {
    templateClouds[t] = toCloud(transformStrokes(glyph.strokes, t));
    distances[t] = cloudDistance(kid, templateClouds[t]!);
  }

  // A transform that looks like the original (e.g. "o", "8", "+") can't be a reversal.
  const identityCloud = templateClouds.identity!;
  const symmetric = (t: Transform) => cloudDistance(identityCloud, templateClouds[t]!) < 0.035;

  let bestTransform: Transform = 'identity';
  for (const t of TRANSFORMS) {
    if (t === 'identity' || symmetric(t)) continue;
    if (distances[t] < distances[bestTransform] * REVERSAL_MARGIN) bestTransform = t;
  }

  const quality = Math.max(0, Math.min(1, 1 - (distances.identity - 0.03) / (MATCH_THRESHOLD * 1.6)));
  const goodStart = checkStart(ink, glyph);

  let verdict: HandwritingVerdict;
  if (bestTransform !== 'identity' && distances[bestTransform] < MATCH_THRESHOLD) {
    verdict = bestTransform === 'flipX' ? 'mirrored' : 'flipped';
  } else if (distances.identity < MATCH_THRESHOLD) {
    verdict = 'correct';
  } else {
    verdict = 'retry';
  }
  return { verdict, quality, goodStart, bestTransform, distances };
}

/** Did the first stroke start near the template start and head in a similar direction? */
function checkStart(ink: Stroke[], glyph: Glyph): boolean {
  const kidAll = ink.flat();
  const tplAll = glyph.strokes.flat();
  const kb = boundingBox(kidAll);
  const tb = boundingBox(tplAll);
  const norm = (p: Point, bb: ReturnType<typeof boundingBox>) => {
    const s = Math.max(bb.width, bb.height, 1);
    return { x: (p.x - bb.minX) / s, y: (p.y - bb.minY) / s };
  };
  const k0 = norm(ink[0][0], kb);
  const t0 = norm(glyph.strokes[0][0], tb);
  const nearStart = Math.hypot(k0.x - t0.x, k0.y - t0.y) < 0.35;

  const dir = (s: Stroke) => {
    const target = Math.min(s.length - 1, Math.max(1, Math.floor(s.length / 4)));
    return { x: s[target].x - s[0].x, y: s[target].y - s[0].y };
  };
  const kd = dir(ink[0]);
  const td = dir(glyph.strokes[0]);
  const dot = kd.x * td.x + kd.y * td.y;
  const mag = Math.hypot(kd.x, kd.y) * Math.hypot(td.x, td.y);
  const sameWay = mag === 0 ? true : dot / mag > 0.3;
  return nearStart && sameWay;
}
