# Game Hub

A collection of **34 classic browser games** — arcade, puzzle, board, card, and word — built as a fast, mobile-first, installable web app.

## Features

- 🎮 **34 games**, each split into pure logic / controls / view modules
- 📱 **Mobile-first** — touch controls and responsive layouts throughout
- 💾 **Save & resume** — 23 games auto-save your progress
- 🔊 **Sound effects** — zero-dependency WebAudio engine (toggle in Settings)
- 🎚️ **Difficulty** — easy / medium / hard on every game
- 🏆 **Achievements**, daily challenges & streaks, and leaderboards
- 👥 **Hotseat** local 2-player (Connect Four, Checkers, Reversi, Battleship)
- 📲 **Installable PWA** with an offline app shell
- ♿ **Accessibility** — focus-trapped dialogs, arrow-key grid navigation, reduced-motion, colorblind mode

## Tech stack

React 18 · TypeScript (strict) · Vite 6 · Tailwind CSS 4 · React Router 6

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build
npm run preview   # preview the production build
npm run typecheck # type-check only
```

## Project structure

- `src/games/<slug>/` — one folder per game: `<Game>.ts` (logic) · `<Game>.controls.tsx` (input) · `<Game>.ui.tsx` (view) · `index.ts`
- `src/lib/` — persistence, sound, difficulty, daily, achievements, seeded RNG
- `src/hooks/` — reusable React hooks (stats, sound, difficulty, save/resume, …)
- `src/features/` — pages (home, library, settings, daily, achievements, …)
- `public/` — PWA manifest, icons, and service worker

See [PROJECT_DOCS.md](./PROJECT_DOCS.md) for the full architecture dossier.
