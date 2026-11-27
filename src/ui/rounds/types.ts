export interface Answer {
  correct: boolean;
  /** Handwriting: started in the right place and went the right way. */
  goodStart?: boolean;
  /** What was reversed (glyph id, or "left-right"), for the parent dashboard. */
  reversal?: string;
  /** Don't count this as a try (e.g. an empty drawing). */
  ignore?: boolean;
  /** Extra feedback to show. */
  feedback?: 'mirrored' | 'flipped' | 'shape' | 'start';
}

export type Feedback = null | 'correct' | 'tryAgain' | 'reveal';

export interface RoundProps<R> {
  round: R;
  onAnswer: (a: Answer) => void;
  /** Play the ghost-hand demonstration instead of accepting input. */
  demo?: boolean;
  onDemoDone?: () => void;
  feedback: Feedback;
}
