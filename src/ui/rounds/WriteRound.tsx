import { motion } from 'framer-motion';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { GLYPH_BOX, strokesToPath, type Stroke } from '../../core/geometry';
import { getGlyph } from '../../core/glyphs';
import type { RoundOf } from '../../core/rounds';
import { evaluateHandwriting } from '../../core/recognizer';
import { audio } from '../../audio/engine';
import { GlyphSvg } from '../components/GlyphSvg';
import { IconButton } from '../components/IconButton';
import type { RoundProps } from './types';

type R = RoundOf<'write'>;

const PAD_W = 300;
const PAD_H = (PAD_W * GLYPH_BOX.height) / GLYPH_BOX.width;

/** Trace / write on a pad. Works with mouse, trackpad, touch and stylus (Pointer Events). */
export function WriteRound({ round, onAnswer, demo, onDemoDone, feedback }: RoundProps<R>) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [mirrorShow, setMirrorShow] = useState(false);
  const drawing = useRef(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const glyph = getGlyph(round.glyphId);
  // Memory writing: the model shows for a moment, then hides. The child writes it from memory.
  const [modelVisible, setModelVisible] = useState(!!round.modelMs);
  useEffect(() => {
    if (!round.modelMs || demo) return;
    const t = window.setTimeout(() => setModelVisible(false), round.modelMs);
    return () => window.clearTimeout(t);
  }, [round.modelMs, demo]);
  const isStroke = glyph.kind === 'stroke';

  const toGlyph = (e: PointerEvent) => {
    const r = svgRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * GLYPH_BOX.width,
      y: ((e.clientY - r.top) / r.height) * GLYPH_BOX.height,
    };
  };

  const locked = demo || feedback === 'correct' || feedback === 'reveal' || mirrorShow || (modelVisible && !demo);

  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (locked) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    setStrokes((s) => [...s, [toGlyph(e)]]);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!drawing.current) return;
    const p = toGlyph(e);
    setStrokes((s) => {
      const last = s[s.length - 1];
      const prev = last[last.length - 1];
      if (Math.hypot(p.x - prev.x, p.y - prev.y) < 1.2) return s;
      return [...s.slice(0, -1), [...last, p]];
    });
  };
  const up = () => {
    drawing.current = false;
  };

  const submit = () => {
    if (locked) return;
    const r = evaluateHandwriting(strokes, glyph);
    if (r.verdict === 'empty') {
      audio.play('gentle');
      onAnswer({ correct: false, ignore: true });
      return;
    }
    if (r.verdict === 'correct') {
      if (round.requireStart && !r.goodStart) {
        // Right shape, wrong start or direction: on stroke levels the start IS the skill.
        setStrokes([]);
        onAnswer({ correct: false, feedback: 'start' });
        return;
      }
      onAnswer({ correct: true, goodStart: r.goodStart });
      return;
    }
    if (r.verdict === 'mirrored' || r.verdict === 'flipped') {
      // Show the child's own drawing turning the right way round.
      setMirrorShow(true);
      window.setTimeout(() => {
        setMirrorShow(false);
        setStrokes([]);
      }, 1800);
      onAnswer({ correct: false, reversal: round.glyphId, feedback: r.verdict });
      return;
    }
    setStrokes([]);
    onAnswer({ correct: false, feedback: 'shape' });
  };

  const showGuideDraw = demo || feedback === 'reveal';

  return (
    <div className="round round--write" data-phase={modelVisible ? 'model' : 'write'}>
      <div className="write-layout">
        <div
          className={`prompt-card reference small ${round.modelMs && !modelVisible && !showGuideDraw ? 'is-hidden' : ''}`}
        >
          {isStroke ? (
            <span className="anchor">✏️</span>
          ) : round.modelMs && !modelVisible && !showGuideDraw ? (
            <svg width="56" height="56" viewBox="0 0 24 24" aria-label="remember">
              <path d="M3 12s3.5-5 9-5 9 5 9 5-3.5 5-9 5-9-5-9-5z" fill="none" stroke="#9aa7b4" strokeWidth="2" />
              <path d="M5 19L19 5" stroke="#9aa7b4" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <>
              <GlyphSvg glyphId={round.glyphId} size={56} />
              {glyph.anchor && <span className="anchor">{glyph.anchor}</span>}
            </>
          )}
        </div>
        <div className="pad" style={{ width: PAD_W, height: PAD_H }} data-testid="write-pad" data-glyph={round.glyphId}>
          <div className="pad-lines" />
          <div className="pad-guide">
            {showGuideDraw ? (
              <GlyphSvg
                key={`draw-${feedback}`}
                glyphId={round.glyphId}
                size={PAD_W}
                color="#4f9d4a"
                strokeWidth={10}
                animateDraw
                drawDuration={1.6}
                showStart
              />
            ) : modelVisible ? (
              <GlyphSvg glyphId={round.glyphId} size={PAD_W} color="#2f86c4" strokeWidth={12} showStart />
            ) : (
              <GlyphSvg
                glyphId={round.glyphId}
                size={PAD_W}
                color="#9aa7b4"
                opacity={round.guideOpacity}
                strokeWidth={14}
                showStart={round.showStart}
              />
            )}
          </div>
          <motion.svg
            ref={svgRef}
            className="pad-ink"
            viewBox={`0 0 ${GLYPH_BOX.width} ${GLYPH_BOX.height}`}
            width={PAD_W}
            height={PAD_H}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            animate={mirrorShow ? { scaleX: [1, -1] } : { scaleX: 1 }}
            transition={{ duration: 0.9, delay: mirrorShow ? 0.5 : 0 }}
          >
            <path
              d={strokesToPath(strokes)}
              fill="none"
              stroke="#5a6b7d"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>
        <div className="write-tools">
          <IconButton label="clear" onClick={() => setStrokes([])} testId="write-clear" disabled={locked}>
            <svg width="36" height="36" viewBox="0 0 24 24">
              <path d="M4 14l7-7 7 7-4 4H8z" fill="#e3d3c5" stroke="#a8978a" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M4 20h16" stroke="#a8978a" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </IconButton>
          <IconButton label="done" variant="primary" onClick={submit} testId="write-done" disabled={locked} size={88}>
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
      {demo && <DemoTimer ms={glyph.strokes.length * 1900 + 1200 + (round.modelMs ?? 0)} onDone={onDemoDone} />}
    </div>
  );
}

/** Invisible element that fires onDone after the stroke animation finishes. */
function DemoTimer({ ms, onDone }: { ms: number; onDone?: () => void }) {
  return (
    <motion.span
      style={{ position: 'absolute', opacity: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.001 }}
      transition={{ duration: ms / 1000 }}
      onAnimationComplete={onDone}
    />
  );
}
