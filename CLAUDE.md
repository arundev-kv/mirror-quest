# Mirror Quest — rules for Claude

A calm learning game for kids aged 3–6 that helps them overcome mirror writing
(reversed letters, digits and signs, and left/right confusion).

## Stack

React 19 + Vite + TypeScript (strict) · React Three Fiber (3D backdrops) · Framer Motion (UI motion) ·
Zustand + persist (state) · vite-plugin-pwa (offline) · Web Audio API (synthesised music/SFX) ·
Vitest (unit) · Playwright (e2e) · oxlint + Prettier · Netlify hosting.

## Hard rules

- **No network calls at runtime.** No APIs, CDNs, remote fonts, HDRIs or analytics. Everything is bundled and
  precached by the service worker. (drei helpers that fetch assets, like `Environment` or `Text`, are not allowed.)
- **localStorage only**, through the single persisted store in `src/state/appStore.ts`, which uses the
  versioned schema in `src/core/storage.ts`. Changing the stored shape = bump `SCHEMA_VERSION` + add a migration + a test.
- **Portable core.** `src/core/` is pure TypeScript: no React, DOM, `window`, `localStorage` or audio. It holds levels,
  round generation, scoring, the daily time limit and handwriting recognition, so it can be ported to React Native or Unity.
  Rendering lives in `src/ui/` and `src/scenes/`.
- **Data-driven levels.** A level is a `LevelConfig` entry in `src/core/levels.ts` (theme + recipe of round kinds).
  New content should not need new components unless it introduces a new round kind.
- **Words, not sentences, during play.** Many players can't read yet, and children with learning difficulties process
  less language while busy. Each stage opens with an intro card (full sentences, read aloud). During play, the on-screen
  cue and the voice are ONE or two words only (`src/ui/copy.ts`: "LEFT", "b", "Trace b"; feedback "Yes!", "Again",
  "Flip", "Look"), with LEFT in grass green and RIGHT in sky blue. The voice is the device's built-in American English
  voice (`src/audio/voice.ts`, Web Speech API, local voices preferred so it stays offline); grown-ups can turn it off.
  A ghost-hand demo plays the first time a round kind appears, and "show me how" replays it.
- **Clinically sequenced stages.** Follow `docs/LEVEL_PLAN.md`: own-body left/right before another person's;
  confusable letters (b/d, p/q) taught apart in their movement families and only contrasted after both are learned;
  support fades within and across stages (errorless learning); every fifth stage is a mixed review.
- **Addiction-safe but bright.** A natural alpine palette (clear sky blue, grass green, wildflower yellow, wood
  brown, snowy peaks): vivid and cheerful like a sunny mountain meadow, never neon. No flashing, pulsing or fast cuts; no streaks, loot boxes, random rewards or "come back" nags. Stars only come from skill. Never a "fail" sound.
  Respect `prefers-reduced-motion`.
- **Daily limit.** 30 min of ACTIVE play per profile per day (tab visible + input in the last 60 s). Sunset countdown from
  25 min; at 30 min a running level may finish (max 2 min grace), then the sleep screen. Resets at local midnight.
  There is **no unlock**, not even for parents. Clock moved backwards keeps the stored usage.
- **Scoring.** Accuracy + a small speed share → 0–100 (speed 0 / 10 / 15 / 20% for ages 3 / 4 / 5 / 6; handwriting and
  body warm-ups are never timed; generous speed targets; calm pauses between rounds). A demo never advances by itself:
  the child taps "Your turn". Stars: 1 for finishing, 2 at ≥70 (unlocks the next level), 3 at ≥90. Retries keep the best
  score. **Mastery** (the level's first-try criterion reached on two different days) gates world 5 and is shown to parents.
- **Input.** Laptop first (mouse/trackpad) but use Pointer Events so touch and stylus work. Hit targets ≥ 64 px.

## Commands

- `npm run dev` — dev server
- `npm test` — unit tests (core)
- `npm run test:e2e` — Playwright (set `CHROME_PATH` to use a local Chrome)
- `npm run lint && npm run typecheck && npm run format:check`

## Adding a level

1. Add a `LevelConfig` to `LEVELS` in `src/core/levels.ts` with `L(n, world, {...})` (title, intro, skill, icon,
   mastery, recipe). Use the recipe helpers (`trace`, `write`, `memory`, `judge`, `body`). Age adapters (guide floor,
   hints, option counts) are applied in `buildRound`, not per level.
2. If it uses new glyphs, add stroke templates to `src/core/glyphs.ts` in teaching order/direction; the recognizer
   tests run over every glyph automatically.
3. `npm test` checks scored round counts (8–12 per age; body warm-ups excluded), glyph ids and one correct option.

See `docs/LEVEL_PLAN.md` for the 30 levels and the clinical reasoning behind each.
