# Stage plan: clinical review

This plan was reviewed from a learning-disability therapist's point of view as well as an engineering one.
The aim is a measurable outcome (fewer reversals in real handwriting), not just a game that runs.

## What the evidence says, and what it means for the game

| Finding                                                                                                                                                                                                                           | Design decision                                                                                                                                                         |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Letter and digit reversals are **developmentally normal until about age 7**. Persistent reversals after that are a flag for assessment, not a diagnosis by themselves.                                                            | Never treat a reversal as failure. The parent dashboard shows _trends_ per character, with a note that reversals before 7 are expected.                                 |
| Children reliably know left and right **on their own body around age 5–6**. Working out **another person's** left and right (a friend facing you) usually develops around **age 7–8**.                                            | Stage 1 uses the child's own body only. "Friend facing me" moves to a late stage and only unlocks for age 6.                                                            |
| **b and d taught side by side cause interference** (the classic confusion). Clinicians teach them in **different movement families**: d starts as **c** ("c, then a tall stick"), b starts as a **stick** ("stick, then a bump"). | b and d are never contrasted until each has been learned alone, in its own family. The contrast stages come only after both are mastered.                               |
| **Motor memory beats visual memory** for orientation. The start point and stroke direction are what stop reversals (Orton-Gillingham, Handwriting Without Tears).                                                                 | Every letter is first traced with a start dot and arrow; the recognizer also scores the start point and direction.                                                      |
| **Errorless learning**: high support first, then fade the support. Errors that get repeated become habits.                                                                                                                        | Guide opacity fades across stages (trace ≈ 0.6, guided ≈ 0.3, memory = 0). On a second miss the game shows the correct answer instead of letting the child guess again. |
| **Short, frequent practice with mixed review** (spacing and interleaving) works better than long blocks.                                                                                                                          | 8–12 rounds per stage, 30 min/day cap, and every fifth stage is a mixed review of the world.                                                                            |
| Young children with learning difficulties **process less language** under load.                                                                                                                                                   | In play, show and say **single words** only ("LEFT", "b", "Trace"). Full sentences only on the stage intro card.                                                        |
| **Time pressure** raises anxiety and errors in children with learning difficulties.                                                                                                                                               | Speed counts for only 30% of the score and only on correct answers. No visible timers during play. _Recommendation:_ consider lowering speed to 10–20% for ages 3–4.    |
| Mastery should be **shown twice** before moving on.                                                                                                                                                                               | A stage unlocks the next at 2 stars (70+). Contrast stages (World 4) should only open after both letters reach 2 stars.                                                 |

## The 30 stages

Ages show where a stage is most suitable. Younger children can stay on Worlds 1–2 for a long time; that is fine.

### World 1: Meadow, my body and direction (ages 3+)

1. ✅ **Left and Right (on me).** Tap the picture on your LEFT or RIGHT side. The L-hand hint fades halfway through.
2. **Which way is it going?** Animals and cars face or move left or right; tap the matching side.
3. **Lines.** Trace top-to-bottom and left-to-right lines (the strokes inside most letters).
4. **The c circle.** Trace circles that start at "2 o'clock" and go the c way (anticlockwise). This one movement builds c, a, d, g, o, q.
5. **Review.** Mixed left/right and strokes, no hints.

### World 2: Alpine lake, the stick family (ages 4+)

6. ✅ **b: stick, then bump.** Trace b with start dots, then write it with a fading guide, then spot a backwards b. (Level 2 in the current build.)
7. **l and t.** Straight-stick letters.
8. **h, n and r.** Stick, then go back up and over.
9. **p: stick down low, then bump.**
10. **Review.** b, h, n, p, r mixed.

### World 3: Forest, the c family (ages 4+)

11. **c and o.**
12. **a: c, then a short stick.**
13. **d: c, then a TALL stick.** (Not shown next to b yet.)
14. **g and q: c, then a stick that goes down low.**
15. **Review.** c, a, d, g, q mixed.

### World 4: Mountain hut, telling look-alikes apart (ages 5+, only after Worlds 2–3)

16. **b or d?** With the "bed" anchor (b and d make a bed: b is the headboard).
17. **Is it the right way?** Judge and flip b, d, p, q.
18. **p or q?**
19. **Write b and d from memory** (model shown, then hidden).
20. **Review.**

### World 5: Village, numbers and signs (ages 4+)

21. **1 and 7.**
22. **2 and 3.**
23. **5.**
24. **6 and 9.**
25. **Signs: + − = ? !**

### World 6: Castle, using it (ages 5–6)

26. **S, Z, J, s, z.**
27. **Words.** Find the word with every letter the right way (bed, dog, bud).
28. **Numbers in order.** 12 vs 21, 13 vs 31.
29. **A friend facing me.** Their left is on your right (age 6 only).
30. **Grand review.**

## How progress is measured

The parent dashboard already tracks the best score, attempts and **how often each character was reversed**.
A useful clinical outcome is the reversal rate for a character dropping across sessions, especially once the
child writes it **without a guide** (World 4, stage 19 and World 6). If a child is over 7 and still reverses often
after Worlds 2–4, the dashboard should suggest talking to a teacher or an occupational therapist.

_This plan is informed by common clinical practice (Orton-Gillingham, Handwriting Without Tears, errorless learning).
It is not a substitute for an assessment by a qualified professional._
