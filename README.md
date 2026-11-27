# Mirror Quest

A calm, offline learning game that helps kids aged 3–6 overcome **mirror writing**: reversed letters
(b/d, p/q, S, Z, J…), digits (2, 3, 5, 7, 9…), signs, and left/right confusion.

- 🖐️ **Level 1 – Left & Right:** tap the thing on your left/right, then work out a friend's left/right when they face you.
- 🐚 **Level 2 – b and d:** spot the one facing the right way, decide if a letter needs flipping, then trace it.
- No reading needed and no voice: a ghost hand shows what to do.
- Handwriting is checked on the device (point-cloud recognizer) and **detects mirrored letters** specifically.
- Scores: 70% accuracy + 30% speed, 1–3 stars, retries keep the best. The next level opens at 2 stars.
- **30 minutes a day** per child, a gentle sunset countdown from 25 minutes, and a calm "see you tomorrow" screen.
  Resets at midnight. No unlock.
- Several kids per device (name, age, avatar). A grown-ups area (hold 3 s + a sum) shows progress, most-reversed
  characters, daily minutes, and export/import of progress.
- Calm low-poly 3D scenes (React Three Fiber), soft generated music and sounds, muted colours, no streaks or nags.
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
