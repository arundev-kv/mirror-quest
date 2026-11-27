# Mirror Quest

A calm, offline learning game that helps kids aged 3–6 overcome **mirror writing**: reversed letters
(b/d, p/q, S, Z, J…), digits (2, 3, 5, 7, 9…), signs, and left/right confusion.

- 🖐️ **Level 1 – Left and Right:** tap the picture on your LEFT or RIGHT side (your left hand makes an "L"). The hint fades halfway.
- ⚾ **Level 2 – b:** b on its own, as "stick, then bump": trace it, write it with a fading guide, then spot a backwards b.
- Stages are sequenced with a learning-disability therapist's lens (see [docs/LEVEL_PLAN.md](docs/LEVEL_PLAN.md)).
- Each stage opens with a short intro that is read aloud. During play, cues are single words ("LEFT", "Trace b"),
  shown and spoken in an American English voice (the device's built-in voice, so it works offline). A ghost hand demonstrates first.
- Handwriting is checked on the device (point-cloud recognizer) and **detects mirrored letters** specifically.
- Scores: 70% accuracy + 30% speed, 1–3 stars, retries keep the best. The next level opens at 2 stars.
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
