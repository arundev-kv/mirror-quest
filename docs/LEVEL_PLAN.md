# Mirror Quest: the 30-level plan

_Written from the point of view of a paediatric learning-disability therapist (handwriting and visual-spatial skills).
Status: **draft for approval**. Nothing here is built yet except where marked ✅._

The goal is a measurable outcome: **fewer reversals when the child writes on paper**, not just a game that runs.
Every level below says what skill it trains, how the child practises it, when it counts as learned, and why it sits where it does.

## 1. Clinical principles behind the plan

| What the evidence says                                                                                                                                                                                                                     | What the game does                                                                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Reversals are normal until about age 7.** All young children start out treating mirror images as "the same thing" (mirror invariance helps us recognise a cup from either side). Reading and writing have to _unlearn_ that for letters. | A reversal is never a failure, never a "wrong" sound. Parents see trends per character, with a note that reversals before 7 are expected.                                                                |
| **Children reverse left-facing characters most** (J.-P. Fischer's "right-writing rule"). Most letters face right, so children over-apply it: **d, q, g, a, j, z, J, 1, 2, 3, 7, 9** get flipped far more than b, p, E, 4, 5, 6.            | Left-facing characters get more rounds, more memory writing and appear in every review.                                                                                                                  |
| **Shape-copying develops in a fixed order** (Beery VMI norms, roughly): vertical line ~2–3 y, horizontal line and circle ~3 y, cross ~4 y, diagonals and square ~4½–5 y, X and triangle ~5–5½ y.                                           | Strokes come before letters. Letters and digits with diagonals (7, z, k) wait until the 5+ band or keep a guide for younger children. Age 3 traces only; free writing starts at 4.                       |
| **Own-body left/right** settles around 5–6 y. **Another person's** left/right (a friend facing you) around 7–8 y.                                                                                                                          | Level 1 uses the child's own body only. "A friend facing me" is level 29, age 6 only, and starts with the friend's back to us.                                                                           |
| **Taught side by side, b and d interfere.** Clinicians teach them in different movement families: b starts with a **stick**, d starts with a **c**. Contrast comes only after each is solid alone.                                         | b (level 7) and d (level 13) are six levels apart, never on screen together, with the digits world in between for consolidation over days. The b/d contrast (world 5) only opens once both are mastered. |
| **Motor memory beats visual memory for orientation** (Orton-Gillingham, Handwriting Without Tears). The start point and first stroke are what stop a reversal.                                                                             | Every letter and digit is first traced with a start dot and an arrow. The recogniser scores the start point and direction, not just the final shape.                                                     |
| **Reversals happen mostly when writing from memory**, much less when copying.                                                                                                                                                              | Each letter goes trace → write with a fading guide → write from memory (model shown, then hidden). Memory writing is the real test.                                                                      |
| **Errorless learning**: give lots of support first, then fade it. A mistake that gets repeated becomes a habit.                                                                                                                            | Guides fade across rounds and levels. On a second miss the game shows the correct answer and the child copies it, instead of guessing again.                                                             |
| **Short, spaced, mixed practice** beats long blocks.                                                                                                                                                                                       | 8–12 rounds per level (3–5 minutes). Every fifth level is a mixed review of its world. The 30-minute daily cap means roughly 6 levels a day at most.                                                     |
| **Language load hurts** children with learning difficulties under effort.                                                                                                                                                                  | During play the prompt is **one word** ("LEFT", "b", "Trace", "Again"). Full sentences only on the intro card before a level.                                                                            |
| **Time pressure raises anxiety and errors**, and fluency only matters once formation is automatic (usually 7+).                                                                                                                            | Speed counts for little, and less for younger children (section 3). No visible timers. Handwriting rounds are never timed.                                                                               |
| **Gross motor before fine motor** (multisensory practice). Big arm movements build the motor plan that small pencil movements use.                                                                                                         | Short, unscored "body" warm-ups: skywriting a letter with a straight arm, stamping the left foot.                                                                                                        |

## 2. Activity types

| Type      | What the child does                                                                                                                     | Round kinds in the code                                                |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **pick**  | Taps one of 2–3 choices: a side, the picture or character facing the right way, or "right way / flipped".                               | `side`, `pick`, `judge`, `facing`                                      |
| **trace** | Traces over a character with a start dot, arrows and a strong guide (opacity 0.6).                                                      | `write` with `guideOpacity ≥ 0.5`, `showStart: true`                   |
| **write** | Writes with a faint guide (0.3), then with no guide. "Memory" = model shown for 2 s, then hidden.                                       | `write` with low or 0 opacity; memory needs a new `showModelMs` option |
| **body**  | A 20–30 s off-screen movement with a ghost-hand demo, then one tap ("Done"). **Not scored**; it does not count towards the 8–12 rounds. | new `body` kind                                                        |

New round kinds needed for some levels: `direction` (which way is the animal going, level 2), `path` (follow from left to right, level 3), `body`, `sequence` (word or number the right way round, level 28). Glyphs still to add: **l, h, n, r, g, 8**. Signs are not taught (Arun's decision).

## 3. Scoring and mastery

**Speed weight by age** (recommended change; today it is 30% for everyone):

| Age | Accuracy | Speed | Why                                                                            |
| --- | -------- | ----- | ------------------------------------------------------------------------------ |
| 3   | 100%     | 0%    | Any time pressure at 3 only adds stress; the time is still stored for parents. |
| 4   | 90%      | 10%   | Slight nudge to keep going, not to rush.                                       |
| 5   | 85%      | 15%   |                                                                                |
| 6   | 80%      | 20%   | Beginning of automatic recognition, which is the precursor of fluent reading.  |

- Speed only ever applies to **pick** rounds the child got right. **Trace and write rounds score 0% speed at every age**: formation quality comes before handwriting speed.
- Keep the current stars: 1★ for finishing, 2★ at 70+ (unlocks the next level), 3★ at 90+. Retries keep the best score.
- **Mastery** (used to gate world 5 and shown to parents) is stricter than unlocking: the level's own criterion below, **reached on two different days**. Recall on a second day shows the skill was learned, not just warm.
- Age is **not** a hard lock, except level 29 (age 6). Younger children can try any level they unlock, and the game adapts: age 3 keeps hints on and the guide never fades below 0.6 (tracing only); age 4 fades to 0.3; ages 5–6 fade to 0.
- Rounds are listed as **ages 3–4 / ages 5–6** (the existing `count` + `extraForOlder`).

## 4. The 30 levels

### World 1: Meadow, my body and which way things go (age 3+)

No letters yet. This world builds the three foundations of orientation: the body as the reference point, noticing that a mirror image is _different_, and the left-to-right, top-to-bottom direction of writing.

**1. Left and right on me** ✅ (built)

- **Skill:** naming left and right on the child's own body.
- **Activity:** body warm-up ("Wave LEFT", "Stamp RIGHT"), then pick (tap the picture on your LEFT or RIGHT). Hint hand for the first half, then no hint.
- **Rounds:** 8 / 10. **Age:** 3+.
- **Mastery:** 8 of 10 right first try without a hint.
- **Rationale:** the body is the reference frame for every later direction. Own body only, because another person's left/right is two years further on. **Change requested:** the current anchor is "your left hand makes an L". That relies on the child knowing the shape of L the right way round, which is exactly what this group mixes up, and most 3-year-olds don't know letters yet. Use the **colour anchor** the game already has (LEFT = grass green, RIGHT = sky blue), and on the intro card suggest that a grown-up puts a green sticker or band on the child's left hand. Age 3 keeps the hint on all the way through.

**2. Which way is it going?**

- **Skill:** seeing that a mirror image points the other way (breaking mirror invariance with pictures before symbols).
- **Activity:** pick: an animal or cart is going LEFT or RIGHT; tap the arrow side it's heading to. Then "same way?": two animals, tap ✓ if they face the same way.
- **Rounds:** 8 / 10. **Age:** 3+.
- **Mastery:** 80% first try.
- **Rationale:** a child can't keep b facing right until they notice that facing matters. Pictures (a goat, a cow, a cart) are easier than letters and carry no reading load.

**3. Start on the left, start at the top**

- **Skill:** the direction of writing: left to right, top to bottom.
- **Activity:** body (skywrite a long line across, then down), trace horizontal lines left→right and vertical lines top→down with a start dot, then pick: "where do we start?" on a path or a row of pictures.
- **Rounds:** 8 / 10. **Age:** 3+.
- **Mastery:** 80% of strokes started at the dot and drawn in the right direction.
- **Rationale:** vertical and horizontal lines are age-3 strokes and appear in nearly every letter. A fixed start (top, left) is the single habit that prevents most reversals later.

**4. The magic c turn**

- **Skill:** the anticlockwise "c" movement starting at about 2 o'clock.
- **Activity:** body (big arm circles the c way), trace circles and c shapes starting at the dot (opacity 0.6), then trace with a fainter guide (0.4).
- **Rounds:** 8 / 10. **Age:** 3+.
- **Mastery:** 80% started at the dot and turned the c way.
- **Rationale:** circles are an age-3 stroke, and this one movement later builds c, o, a, d, g, q, e, 9 and 6. Many d and 9 reversals come from starting the circle clockwise; locking in the direction now prevents them.

**5. Meadow review**

- **Skill:** body sides, facing, stroke direction, c turn, all mixed.
- **Activity:** pick and trace interleaved, no hints.
- **Rounds:** 10 / 12. **Age:** 3+.
- **Mastery:** 80% first try, including the start point.
- **Rationale:** interleaving forces the child to choose the right response each time, which is what transfers to real tasks.

### World 2: Alpine lake, the stick family (age 4+)

Letters that start with a tall stick from the top. These all face **right**, so they are the easiest to keep the right way, which builds early confidence.

**6. l and t**

- **Skill:** straight-stick letters; t adds a cross (a 4-year stroke).
- **Activity:** body (skywrite "stick down"), trace (0.6), write (0.3), then pick "which t is right?".
- **Rounds:** 8 / 10. **Age:** 4+ (age 3: trace only).
- **Mastery:** 80% written with the right start and stroke order.
- **Rationale:** the simplest letters with a clear top start. Establishes "letters start at the top".

**7. b: stick, then bump** ✅ (built as level 2; **move it here**)

- **Skill:** b on its own.
- **Activity:** body (skywrite b, saying "stick, back up, bump"), trace (0.6), write (0.25), then judge "right way?" for b only.
- **Rounds:** 8 / 10. **Age:** 4+.
- **Mastery:** b from a faint guide with the right start in 80%, and "right way?" 80%.
- **Rationale:** b is taught as a stick-family letter, far away from d, so the two never compete in memory. Judge rounds use b only, never b next to d. **Change requested:** in the current build b is level 2, straight after left/right. That puts letter writing before any stroke practice, which is too early for 3–4-year-olds.

**8. h, n and r**

- **Skill:** stick, then back up and over.
- **Activity:** trace (0.6), write (0.3), pick.
- **Rounds:** 8 / 10. **Age:** 4+.
- **Mastery:** 80% right start and direction.
- **Rationale:** the same "down, back up, over" path as b, so it strengthens the b motor plan without adding a look-alike. h and n are rarely reversed, which keeps success high.

**9. p: stick down low, then bump**

- **Skill:** p on its own.
- **Activity:** body, trace (0.6), write (0.3), judge "right way?" for p only.
- **Rounds:** 8 / 10. **Age:** 4+.
- **Mastery:** same as b.
- **Rationale:** p is "b's family, but the stick goes down low". Linking it to b (not to q) keeps it in the stick family.

**10. Lake review**

- **Skill:** l, t, b, h, n, r, p mixed.
- **Activity:** write with a faint guide, then **two memory rounds** (model 2 s, then hidden), plus judge.
- **Rounds:** 10 / 12. **Age:** 4+.
- **Mastery:** 80%, including memory rounds.
- **Rationale:** first memory writing, on right-facing letters where the child is most likely to succeed.

### World 3: Pine forest, the c family (age 4+)

Letters that start with the magic c from level 4. These face **left**, so they are the ones children reverse most. They get the most practice in the whole game.

**11. c, o and e**

- **Skill:** magic c; o closes it; e is "a line across, then c".
- **Activity:** body (big c), trace (0.6), write (0.3), judge.
- **Rounds:** 8 / 10. **Age:** 4+.
- **Mastery:** 80% started at 2 o'clock and turned the c way.
- **Rationale:** e is one of the most reversed lowercase letters, and it is fixed by the same c movement.

**12. a: c, then a short stick**

- **Skill:** a, built from c.
- **Activity:** trace (0.6), write (0.3), judge.
- **Rounds:** 8 / 10. **Age:** 4+.
- **Mastery:** 80% with c first, stick second.
- **Rationale:** a is the safe rehearsal for d: the same movement with a short stick. If a is solid, d only needs "make the stick tall".

**13. d: c, then a TALL stick**

- **Skill:** d on its own.
- **Activity:** body (skywrite "c, up tall, down"), trace (0.6), write (0.3), write (0.15), judge for d only.
- **Rounds:** 10 / 12 (more than usual: d is left-facing and the most reversed letter).
- **Age:** 4+.
- **Mastery:** 80% with c first, and "right way?" 80%.
- **Rationale:** d is never shown next to b here. Its anchor is motor ("c first"), not visual, because the c start makes a mirrored d physically awkward to write.

**14. g and q: c, then a stick that goes down low**

- **Skill:** g and q from c.
- **Activity:** trace (0.6), write (0.3), judge.
- **Rounds:** 8 / 10. **Age:** 4+.
- **Mastery:** 80%.
- **Rationale:** q lives in the c family, the way p lives in the stick family. That separation is what lets p and q be told apart later.

**15. Forest review**

- **Skill:** c, o, e, a, d, g, q mixed.
- **Activity:** faint-guide writing, **memory writing for d and q**, judge.
- **Rounds:** 10 / 12. **Age:** 4+.
- **Mastery:** 80%, including memory rounds.
- **Rationale:** consolidates the left-facing letters before the digits break.

### World 4: Village, numbers (age 4+)

Digits sit between learning d and contrasting b/d on purpose: a few days of other practice lets each letter consolidate on its own before they are compared. Most young children learn digits 1–9 around 4–5.

**16. 1 and 7**

- **Skill:** 1 ("hat, then stick down"), 7 ("across, then slide down").
- **Activity:** body, trace (0.6), write (0.3), judge.
- **Rounds:** 8 / 10. **Age:** 4+ (7's diagonal stays traced for age 4; written from 5).
- **Mastery:** 80% right start (top) and direction.
- **Rationale:** both face left and are very often reversed. Starting at the top and going **right** first anchors them.

**17. 2 and 3**

- **Skill:** both start with the same "up and over to the right" curve.
- **Activity:** trace, write, judge.
- **Rounds:** 8 / 10. **Age:** 4+.
- **Mastery:** 80%.
- **Rationale:** 2 and 3 are the most reversed digits. They share a first stroke, so one motor plan fixes both.

**18. 4 and 5**

- **Skill:** 4 ("down, across, cut through"), 5 ("down, round the belly, hat last").
- **Activity:** trace, write, judge.
- **Rounds:** 8 / 10. **Age:** 4+.
- **Mastery:** 80%.
- **Rationale:** right-facing and reversed less, so this is a success level that keeps motivation up between two hard pairs.

**19. 9, then 6**

- **Skill:** 9 is "magic c, then a stick" (like g); 6 is "slide down and curl".
- **Activity:** trace and write 9, then trace and write 6, with judge for each **separately**. No 6-or-9 picking.
- **Rounds:** 8 / 10. **Age:** 4+.
- **Mastery:** 80%.
- **Rationale:** 9 reuses the c-family plan from world 3. Putting 6 and 9 in one level is fine, but they are not contrasted against each other here, for the same reason as b/d.

**20. Village review**

- **Skill:** digits 1–9 (with 0 and 8 as easy fillers), mixed.
- **Activity:** faint-guide and memory writing for 2, 3, 7, 9, plus judge.
- **Rounds:** 10 / 12. **Age:** 4+.
- **Mastery:** 80%, including memory rounds.
- **Rationale:** left-facing digits get the memory rounds, because that's where reversals show up.

### World 5: Mountain hut, telling look-alikes apart (age 5+, only after mastery)

**Gate:** opens only when levels 7 (b), 9 (p), 13 (d) and 14 (g, q) are each mastered (criterion reached on two different days). The intro card explains this to parents if the child gets there early.

**21. b or d?**

- **Skill:** discriminating b from d.
- **Activity:** body ("b: stick first. d: c first"), then pick b or d with the motor cue shown ("stick" or "c"), then without the cue.
- **Rounds:** 10 / 12. **Age:** 5+.
- **Mastery:** 85% first try.
- **Rationale:** the cue is the **motor** one each letter was taught with, not a left/right rule. The common "bed" and fist tricks depend on left/right and on reading, which is fragile at this age, so they're offered on the intro card for parents only.

**22. Right way or flipped?**

- **Skill:** judging and correcting b, d, p, q.
- **Activity:** judge: tap ✓ or flip the character. Wrong twice → the correct one is shown and traced once.
- **Rounds:** 10 / 12. **Age:** 5+.
- **Mastery:** 85%.
- **Rationale:** self-checking is the skill a child needs when writing alone. Seeing and fixing the flip uses the same check.

**23. p or q?**

- **Skill:** discriminating p from q.
- **Activity:** pick with the motor cue ("stick" for p, "c" for q), then without.
- **Rounds:** 10 / 12. **Age:** 5+.
- **Mastery:** 85% first try.
- **Rationale:** same method as b/d. Taught after b/d so the child already knows the "which family?" strategy.

**24. Write b, d, p and q from memory**

- **Skill:** recall writing, the real test.
- **Activity:** memory writing (model 2 s, then hidden), mixed order; second miss → trace the correct one.
- **Rounds:** 8 / 10. **Age:** 5+.
- **Mastery:** 80% right way round and right start.
- **Rationale:** reversals live in memory writing, so this level predicts paper handwriting best. This is the key number for the parent dashboard.

**25. Hut review**

- **Skill:** b, d, p, q, plus left-facing digits 2, 3, 7, 9 and the c-family letters.
- **Activity:** judge, pick and memory writing, interleaved.
- **Rounds:** 10 / 12. **Age:** 5+.
- **Mastery:** 85%.
- **Rationale:** mixing letters and digits stops the child relying on "this level is only about b and d".

### World 6: Castle, using it (ages 5–6)

**26. Tricky small letters: s, z and j**

- **Skill:** the remaining left-facing, often-reversed lowercase letters.
- **Activity:** body (skywrite s and z), trace (0.6), write (0.3 → 0), judge.
- **Rounds:** 10 / 12. **Age:** 5+ (z has a diagonal).
- **Mastery:** 80%, including two memory rounds.
- **Rationale:** z and j face left, so the right-writing rule flips them. s has no stick or c to anchor it, so it needs its own start ("start like c, then swing back").

**27. Tricky capitals: S, Z, J and N**

- **Skill:** the capitals children reverse most.
- **Activity:** trace (0.6), write (0.3 → 0), judge, then pick the capital to match its small letter (S–s, Z–z, J–j).
- **Rounds:** 8 / 10. **Age:** 5+ (Z and N have diagonals).
- **Mastery:** 80%.
- **Rationale:** most capitals are seldom reversed, but these four are, and they appear in children's names, which they write more than anything else. Split from level 26 so neither level carries too many new shapes at once.

**28. Left to right: words and numbers**

- **Skill:** sequence direction: reading and writing a whole word or number left to right.
- **Activity:** pick the picture for "bed", "dog", "pig", "bud" (each letter the right way); pick 12 vs 21 and 13 vs 31 by matching dots.
- **Rounds:** 8 / 10. **Age:** 5+ (age 5 matches pictures; age 6 also reads the word).
- **Mastery:** 80%.
- **Rationale:** mirror writing affects whole sequences (12 → 21), not only single characters. Level 3's left-to-right rule is applied to real material here.

**29. A friend facing me**

- **Skill:** another person's left and right.
- **Activity:** body (stand back to back with a grown-up: same left), then pick a friend's left/right hand, first with their **back** to us (same as mine), then facing us (opposite).
- **Rounds:** 8 / 10. **Age:** 6 only.
- **Mastery:** 80% on facing-us rounds.
- **Rationale:** perspective-taking develops around 7–8, so this is a stretch even at 6, and it's the only age-locked level. The back view comes first so the child can map onto their own body, then the turn adds the swap.

**30. Grand review**

- **Skill:** everything, mixed.
- **Activity:** pick, judge and memory writing across all worlds, weighted towards left-facing characters and any character the child reversed most (from the reversal counts already stored).
- **Rounds:** 12 / 12. **Age:** 5+.
- **Mastery:** 85%.
- **Rationale:** a personalised, spaced review is the closest the game gets to a reassessment. Retrying it later is the progress check.

## 5. How progress is measured

- The parent dashboard already stores the best score, attempts and **how often each character was reversed**. The most useful outcome is the reversal rate per character **in memory writing** (levels 10, 15, 20, 24, 30) dropping over weeks.
- Show trends, not single scores. Reversals before 7 are expected.
- If a child **over 7** still reverses often after worlds 2–5, the dashboard should suggest talking to a teacher or an occupational therapist. It should never use the word "dyslexia" or suggest a diagnosis.

## 6. Engineering changes this plan implies (for the build thread)

1. Re-order: built level 2 (b) becomes level 7; levels 2–6 are new.
2. Level 1: swap the L-hand anchor for the green/blue colour anchor and a parent sticker tip; age 3 keeps the hint on.
3. Scoring: speed weight by age (0 / 10 / 15 / 20%); `write` rounds never speed-scored.
4. Mastery on two different days, stored per level, to gate world 5.
5. New round kinds: `direction`, `path`, `body`, `sequence`; memory option on `write`.
6. New glyphs: l, h, n, r, g, 8. Signs are out of scope, so the existing plus, minus, equals, question and exclaim glyphs are unused.
7. Age adapters: guide floor 0.6 at age 3, 0.3 at age 4, 0 at 5–6.

_This plan follows common clinical practice (Orton-Gillingham, Handwriting Without Tears, errorless learning, Beery VMI developmental norms, J.-P. Fischer's research on mirror writing). It is a design for a practice game, not a substitute for assessment by a qualified professional._
