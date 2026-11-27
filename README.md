# Mirror Quest

A calm, offline learning game that helps kids aged 3–6 overcome **mirror writing**: reversed letters
(b/d, p/q, S, Z, J…), digits (2, 3, 5, 7, 9…), signs, and left/right confusion.

- **30 levels in 6 worlds**, sequenced with a learning-disability therapist's lens (see [docs/LEVEL_PLAN.md](docs/LEVEL_PLAN.md)):
  1. 🌻 Meadow: my body's left and right, which way things go, where writing starts, the magic c turn.
  2. ⛵ Lake: the stick family (l, t, b, h, n, r, p).
  3. 🌲 Forest: the c family (c, o, e, a, d, g, q).
  4. 🏘️ Village: digits 1–9.
  5. 🏔️ Mountain hut: b or d, p or q, writing from memory. Opens once b, p, d and g/q are learned on two different days.
  6. 🏰 Castle: s, z, j, tricky capitals, words and numbers left to right, a friend's left and right (age 6), grand review.
- Round types: body warm-ups, tap a side, which way / same way, where to start, pick, right way or flipped, trace and
  write (with memory writing), and words/numbers in order.
- Each stage opens with a short intro that is read aloud. During play, cues are single words ("LEFT", "Trace b"),
  shown and spoken in an American English voice (the device's built-in voice, so it works offline). A ghost hand demonstrates first.
- Handwriting is checked on the device (point-cloud recognizer) and **detects mirrored letters** specifically.
- Scores: mostly accuracy, with a small speed share for taps only (0 / 10 / 15 / 20% at ages 3 / 4 / 5 / 6). 1–3 stars,
  retries keep the best. The next level opens at 2 stars.
- **30 minutes a day** per child, a gentle sunset countdown from 25 minutes, and a calm "see you tomorrow" screen.
  Resets at midnight. No unlock.
- Several kids per device (name, age, avatar). A grown-ups area (hold 3 s + a sum) shows progress, most-reversed
  characters, daily minutes, and export/import of progress.
- Bright, natural alpine low-poly 3D scenes (React Three Fiber), soft generated music and sounds, no streaks, nags or flashing.
- **Works offline** (PWA) and stores everything in the browser's localStorage. No accounts, no servers, no API calls.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests
npm run test:e2e     # browser tests (CHROME_PATH=/path/to/chrome to use a local Chrome)
npm run build        # production build in dist/
```

## Deploy to Netlify (free)

1. In Netlify choose **Add new site → Import an existing project → GitHub** and pick this repo.
2. Build command `npm run build`, publish directory `dist` (already set in `netlify.toml`).
3. Deploy. Open the site once while online; after that it works offline and can be installed ("Add to Home Screen" /
   install icon in the address bar).

## Project layout

```
src/core     pure TypeScript game logic (levels, scoring, time limit, handwriting, storage) — portable
src/state    Zustand stores (persisted app data + UI navigation)
src/ui       React screens, rounds and components
src/scenes   React Three Fiber backdrops per theme
src/audio    Web Audio synth for music and sound effects
e2e          Playwright tests
docs         level plan
```

See [CLAUDE.md](CLAUDE.md) for the project rules and [docs/LEVEL_PLAN.md](docs/LEVEL_PLAN.md) for the 30-level plan.
