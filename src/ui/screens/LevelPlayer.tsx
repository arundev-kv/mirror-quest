import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { audio } from '../../audio/engine';
import { speak, stopSpeaking } from '../../audio/voice';
import { generateRounds, getLevel, SPEED_TARGET_MS, type Round, type RoundKind } from '../../core/levels';
import { scoreLevel, speedWeightForAge, type RoundOutcome } from '../../core/scoring';
import type { Profile } from '../../core/types';
import { useApp } from '../../state/appStore';
import { useUi } from '../../state/uiStore';
import {
  FEEDBACK_TEXT,
  instructionFor,
  instructionSpeech,
  WATCH_WORD,
  YOUR_TURN_WORD,
  type FeedbackKind,
} from '../copy';
import { IconButton } from '../components/IconButton';
import { Instruction } from '../components/Instruction';
import { Mascot, type MascotMood } from '../components/Mascot';
import { FacingRound } from '../rounds/FacingRound';
import { JudgeRound } from '../rounds/JudgeRound';
import { PickRound } from '../rounds/PickRound';
import { SideRound } from '../rounds/SideRound';
import type { Answer, Feedback, RoundProps } from '../rounds/types';
import { WriteRound } from '../rounds/WriteRound';

function RoundView(props: RoundProps<Round>) {
  const { round } = props;
  switch (round.kind) {
    case 'side':
      return <SideRound {...props} round={round} />;
    case 'facing':
      return <FacingRound {...props} round={round} />;
    case 'pick':
      return <PickRound {...props} round={round} />;
    case 'judge':
      return <JudgeRound {...props} round={round} />;
    case 'write':
      return <WriteRound {...props} round={round} />;
  }
}

/** Calm pacing: time to enjoy a right answer, or to look at a hint, before moving on. */
const FEEDBACK_MS = { correct: 1600, tryAgain: 2000, flip: 2800, reveal: 3500 };

export function LevelPlayer({ levelId, profile }: { levelId: string; profile: Profile }) {
  const level = getLevel(levelId)!;
  const go = useUi((s) => s.go);
  const recordResult = useApp((s) => s.recordResult);
  const recordReversal = useApp((s) => s.recordReversal);

  const [seed] = useState(() => Math.floor(Math.random() * 1e9));
  const rounds = useMemo(() => generateRounds(level, profile.age, seed), [level, profile.age, seed]);
  // A separate example round per kind for the ghost-hand demo, so the demo never gives away a scored answer.
  const demoRounds = useMemo(() => {
    const sample = generateRounds(level, profile.age, seed + 1);
    const map = new Map<RoundKind, Round>();
    for (const r of sample) if (!map.has(r.kind)) map.set(r.kind, r);
    return map;
  }, [level, profile.age, seed]);

  const [index, setIndex] = useState(0);
  const [tries, setTries] = useState(1);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [feedbackKind, setFeedbackKind] = useState<FeedbackKind | null>(null);
  const [demoKind, setDemoKind] = useState<RoundKind | null>(rounds[0].kind);
  const [demoFinished, setDemoFinished] = useState(false);
  const seenKinds = useRef(new Set<RoundKind>([rounds[0].kind]));
  const outcomes = useRef<RoundOutcome[]>([]);
  const roundStart = useRef(0);
  const [mood, setMood] = useState<MascotMood>('idle');
  const timer = useRef<number | null>(null);

  const round = rounds[index];

  useEffect(() => {
    roundStart.current = performance.now();
  }, []);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  // Voice: read the intro, then each instruction when it appears, then feedback.
  const spokenRound = demoKind ? (demoRounds.get(demoKind) ?? round) : round;
  useEffect(() => {
    if (showIntro) speak(`Level ${level.number}. ${level.title}. ${level.intro}`);
    else if (demoKind) speak(demoFinished ? YOUR_TURN_WORD : WATCH_WORD);
    else speak(instructionSpeech(spokenRound));
    // Speak once per new round or demo, not on every re-render.
  }, [showIntro, demoKind, demoFinished, index]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (feedbackKind) speak(FEEDBACK_TEXT[feedbackKind]);
  }, [feedbackKind]);
  useEffect(() => () => stopSpeaking(), []);

  const finish = useCallback(() => {
    const result = scoreLevel(outcomes.current, speedWeightForAge(profile.age));
    const previous = profile.levels[level.id];
    recordResult(level.id, result);
    audio.play('complete');
    go({ name: 'results', levelId: level.id, result, previous });
  }, [go, level.id, profile.age, profile.levels, recordResult]);

  const advance = useCallback(() => {
    setFeedback(null);
    setFeedbackKind(null);
    setTries(1);
    setMood('idle');
    const next = index + 1;
    if (next >= rounds.length) {
      finish();
      return;
    }
    setIndex(next);
    roundStart.current = performance.now();
    const kind = rounds[next].kind;
    if (!seenKinds.current.has(kind)) {
      seenKinds.current.add(kind);
      setDemoKind(kind);
    }
  }, [finish, index, rounds]);

  const later = (ms: number, fn: () => void) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };

  const onAnswer = (a: Answer) => {
    if (feedback) return;
    if (a.ignore) {
      setMood('thinking');
      return;
    }
    const timeMs = performance.now() - roundStart.current;
    if (a.reversal) recordReversal(a.reversal);
    if (a.correct) {
      outcomes.current.push({
        correct: true,
        tries,
        timeMs,
        targetMs: SPEED_TARGET_MS[round.kind],
        goodStart: a.goodStart,
      });
      audio.play('correct');
      setMood('happy');
      setFeedback('correct');
      setFeedbackKind('correct');
      later(FEEDBACK_MS.correct, advance);
      return;
    }
    if (tries === 1) {
      audio.play('gentle');
      setMood('thinking');
      setFeedback('tryAgain');
      setFeedbackKind(a.feedback === 'mirrored' || a.feedback === 'flipped' ? a.feedback : 'tryAgain');
      later(a.feedback === 'mirrored' || a.feedback === 'flipped' ? FEEDBACK_MS.flip : FEEDBACK_MS.tryAgain, () => {
        setFeedback(null);
        setFeedbackKind(null);
        setTries(2);
        setMood('idle');
      });
      return;
    }
    // Second miss: calmly show the right answer, then move on. No "fail" sound.
    outcomes.current.push({ correct: false, tries, timeMs, targetMs: SPEED_TARGET_MS[round.kind] });
    setFeedback('reveal');
    setFeedbackKind('reveal');
    setMood('idle');
    later(FEEDBACK_MS.reveal, advance);
  };

  // The demo never moves on by itself: the child (or grown-up) confirms with "Your turn".
  const demoDone = () => setDemoFinished(true);
  const startRound = () => {
    setDemoKind(null);
    setDemoFinished(false);
    roundStart.current = performance.now();
  };

  return (
    <div className="level" data-testid="level" data-level={level.id}>
      <header className="level-bar">
        <IconButton label="back to map" onClick={() => go({ name: 'map' })} testId="level-home" size={60}>
          <svg width="30" height="30" viewBox="0 0 24 24">
            <path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z" fill="#8fa3b5" />
          </svg>
        </IconButton>
        <div className="progress-dots" aria-label={`round ${index + 1} of ${rounds.length}`} data-testid="progress">
          {rounds.map((_, i) => (
            <span key={i} className={`dot ${i < index ? 'done' : ''} ${i === index ? 'now' : ''}`} />
          ))}
        </div>
        <IconButton
          label="show me how"
          onClick={() => {
            setDemoFinished(false);
            setDemoKind(round.kind);
          }}
          testId="level-help"
          size={60}
          disabled={!!demoKind}
        >
          <svg width="30" height="30" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" fill="none" stroke="#8fa3b5" strokeWidth="2" />
            <circle cx="12" cy="12" r="3" fill="#8fa3b5" />
          </svg>
        </IconButton>
      </header>

      {!showIntro && (
        <Instruction
          segments={demoKind ? [demoFinished ? YOUR_TURN_WORD : WATCH_WORD] : instructionFor(round)}
          hint={null}
          feedback={feedbackKind ? FEEDBACK_TEXT[feedbackKind] : null}
          onReplay={() => speak(instructionSpeech(spokenRound))}
        />
      )}

      <main className="level-stage">
        <AnimatePresence mode="wait">
          {showIntro ? (
            <motion.div
              key="intro"
              className="intro-card"
              data-testid="intro"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <span className="intro-icon">{level.icon}</span>
              <h2>
                Level {level.number}: {level.title}
              </h2>
              <p>{level.intro}</p>
              <p className="muted">First, a hand will show you how to play. Then it is your turn!</p>
              <IconButton
                label="start"
                variant="primary"
                size={96}
                onClick={() => setShowIntro(false)}
                testId="intro-start"
              >
                <svg width="44" height="44" viewBox="0 0 24 24">
                  <path d="M8 5l11 7-11 7z" fill="#fff" />
                </svg>
              </IconButton>
            </motion.div>
          ) : demoKind ? (
            <motion.div
              key={`demo-${demoKind}-${index}`}
              className="demo-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              data-testid="demo"
            >
              <RoundView
                round={demoRounds.get(demoKind) ?? round}
                onAnswer={() => {}}
                demo
                onDemoDone={demoDone}
                feedback={null}
              />
              <span className="demo-badge" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24">
                  <path
                    d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"
                    fill="none"
                    stroke="#2f86c4"
                    strokeWidth="2"
                  />
                  <circle cx="12" cy="12" r="3" fill="#2f86c4" />
                </svg>
                {WATCH_WORD}
              </span>
              {demoFinished && (
                <motion.div
                  className="your-turn"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <IconButton label="your turn" variant="primary" size={110} onClick={startRound} testId="your-turn">
                    <svg width="50" height="50" viewBox="0 0 24 24">
                      <path d="M8 5l11 7-11 7z" fill="#fff" />
                    </svg>
                  </IconButton>
                  <strong>{YOUR_TURN_WORD}</strong>
                </motion.div>
              )}
              <button
                type="button"
                className="skip-demo"
                aria-label="skip demo"
                data-testid="skip-demo"
                onClick={startRound}
              >
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path d="M6 5l8 7-8 7zM16 5h2v14h-2z" fill="#8fa3b5" />
                </svg>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`round-${index}`}
              className="round-wrap"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
              data-testid="round"
              data-index={index}
              data-kind={round.kind}
              data-tries={tries}
            >
              <RoundView round={round} onAnswer={onAnswer} feedback={feedback} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="level-mascot">
        <Mascot mood={mood} size={100} />
      </footer>
    </div>
  );
}
