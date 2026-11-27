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
- **Kids can't read, and there is no voice.** Every instruction is shown: a ghost-hand demo plays the first time a
  round kind appears, and the "show me how" button replays it. Use icons, not words, in kid-facing UI.
  Text is fine only on grown-up screens (parent gate/dashboard, create profile).
- **Addiction-safe and calm.** Muted pastel palette (sage, sky, sand, lavender); no saturated red/neon, flashing or
  pulsing; no streaks, loot boxes, random rewards or "come back" nags. Stars only come from skill. Never a "fail" sound.
  Respect `prefers-reduced-motion`.
- **Daily limit.** 30 min of ACTIVE play per profile per day (tab visible + input in the last 60 s). Sunset countdown from
  25 min; at 30 min a running level may finish (max 2 min grace), then the sleep screen. Resets at local midnight.
  There is **no unlock**, not even for parents. Clock moved backwards keeps the stored usage.
- **Scoring.** 70% accuracy + 30% speed → 0–100. Stars: 1 for finishing, 2 at ≥70 (unlocks the next level), 3 at ≥90.
  Retries keep the best score.
- **Input.** Laptop first (mouse/trackpad) but use Pointer Events so touch and stylus work. Hit targets ≥ 64 px.

## Commands

- `npm run dev` — dev server
- `npm test` — unit tests (core)
- `npm run test:e2e` — Playwright (set `CHROME_PATH` to use a local Chrome)
- `npm run lint && npm run typecheck && npm run format:check`

## Adding a level

1. Add a `LevelConfig` to `LEVELS` in `src/core/levels.ts` (id `L03`, theme, icon, recipe).
2. If it uses new glyphs, add stroke templates to `src/core/glyphs.ts` in teaching order/direction; the recognizer
   tests run over every glyph automatically.
3. `npm test` checks round counts (8–12 per age) and glyph ids.

See `docs/LEVEL_PLAN.md` for the planned 30 levels.
