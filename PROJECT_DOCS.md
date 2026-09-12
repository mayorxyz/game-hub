# Game Hub — System Architecture & Component Dossier

**Version:** 2.0  
**Last Updated:** 2026  
**Purpose:** Developer reference manual for navigation, understanding, and customization

---

## 1. FILE & DIRECTORY TREE

```
src/
├── App.tsx                       # Router (lazy-loaded routes) + appearance settings
├── main.tsx                      # React entry point (+ service-worker registration)
├── index.css                     # Tailwind import, reduced-motion + colorblind rules
├── components/
│   ├── app/AppShell.tsx          # Navigation shell (desktop + mobile menu)
│   ├── game/GameArtwork.tsx      # CSS-based game thumbnails
│   └── ui/
│       ├── AchievementToast.tsx  # Achievement unlock toast
│       ├── Button.tsx
│       ├── CalendarHeatmap.tsx   # Daily-progress heatmap
│       ├── DifficultySelector.tsx
│       ├── GameCard.tsx
│       ├── GameLayout.tsx        # Game HUD (+ optional difficulty selector)
│       ├── Modal.tsx             # Accessible dialog (focus trap + Escape)
│       ├── PassDeviceOverlay.tsx # Hotseat pass-the-device screen
│       └── controls/             # VirtualDPad, TouchActionButton, TouchControlContainer
├── data/games.ts                 # Game registry (34 games)
├── features/                     # Pages: home, library, game-preview, game-session,
│                                 #   history, favorites, leaderboard, achievements, daily, settings
├── games/                        # 34 games, each modular:
│   └── <game>/
│       ├── <Game>.ts             # Pure logic (no React)
│       ├── <Game>.controls.tsx   # Input handling
│       ├── <Game>.ui.tsx         # React view
│       └── index.ts              # Barrel export
├── hooks/
│   ├── useAchievements.ts        # Unlocked achievements
│   ├── useDifficulty.ts          # Difficulty (synced across components)
│   ├── useGameResult.ts          # Records finished games
│   ├── useGameStatePersistence.ts# Save / resume
│   ├── useGridKeyNav.ts          # Arrow-key grid navigation (a11y)
│   ├── useSettings.ts            # Theme / settings
│   ├── useSound.ts               # Sound-effect helper
│   └── useStats.ts               # Lifetime stats
├── lib/
│   ├── achievements.ts           # Achievement definitions + unlock checks
│   ├── daily.ts                  # Daily challenge, progress, streaks
│   ├── difficulty.ts             # Difficulty presets / multipliers
│   ├── gameResult.ts             # finishGame(): stats + daily + achievements (+ end sound)
│   ├── persistence.ts            # Versioned localStorage layer (gamehub_* keys)
│   ├── random.ts                 # Seeded RNG (mulberry32) + date keys
│   ├── sound.ts                  # Zero-dependency WebAudio engine
│   └── storage.ts                # Low-level storage wrapper
└── types/game.ts                 # GameDefinition + shared types

public/
├── icon.svg · icon-192.png · icon-512.png · icon-512-maskable.png
├── manifest.webmanifest          # PWA manifest
└── sw.js                         # Service worker (offline shell)
```

### Key Folder Responsibilities

| Folder | Responsibility |
|--------|----------------|
| `components/ui/` | Reusable UI (layout, modal, difficulty selector, overlays) |
| `components/ui/controls/` | Touch-control primitives for mobile |
| `data/` | Game registry and metadata (34 games) |
| `features/` | Feature pages (home, library, settings, daily, achievements, …) |
| `games/` | 34 games as `<Game>.ts` + `.controls.tsx` + `.ui.tsx` + `index.ts` |
| `hooks/` | Custom React hooks |
| `lib/` | Utility libraries (persistence, sound, difficulty, daily, random) |
| `public/` | PWA manifest, icons, service worker |
| `types/` | TypeScript type definitions |
---

## 2. CORE INFRASTRUCTURE & DATA FLOW

### 2.1 Game Registry (`src/data/games.ts`)

**Purpose:** Central registry of all 34 games with metadata

**Structure:**
```typescript
export const games: GameDefinition[] = [
  {
    id: string,                    // Unique identifier (e.g., 'snake')
    name: string,                  // Display name (e.g., 'Snake')
    slug: string,                  // URL slug (e.g., 'snake')
    description: string,           // Full description
    shortDescription: string,      // One-line summary
    category: 'arcade' | 'puzzle' | 'card' | 'word' | 'turn-based',
    genres: string[],              // Genre tags
    mode: 'single' | 'multiplayer' | 'ai',
    difficulty: 'easy' | 'medium' | 'hard',
    estimatedPlayTime: string,     // e.g., '2-10 min'
    controls: {
      keyboard?: string[],
      mouse?: string[],
      touch?: string[],
    },
    instructions: {
      objective: string,
      howToPlay: string[],
      scoring?: string,
      tips?: string[],
    },
    accent: string,                // Hex color for game accent
    component: LazyExoticComponent, // Lazy-loaded React component
    supportsSave: boolean,
    supportsHighScore: boolean,
    supportsPause: boolean,
    featured: boolean,             // Show on home page
    tags: string[],                // Search/filter tags
  },
  // ... 29 more games
];
```

**Retrieval Functions:**
```typescript
// Get game by slug (URL routing)
export function getGameBySlug(slug: string): GameDefinition | undefined

// Get game by ID (persistence)
export function getGameById(id: string): GameDefinition | undefined

// Get all games
export function getAllGames(): GameDefinition[]

// Get featured games
export function getFeaturedGames(): GameDefinition[]

// Filter games by category
export function getGamesByCategory(category: string): GameDefinition[]
```

### 2.2 Persistence Layer (`src/lib/persistence.ts`)

**Purpose:** Centralized localStorage management with namespaced keys

**Namespace:** `gamehub`

**Key Structure:**
```
gamehub.games.{gameId}.highScore    // High score for game
gamehub.games.{gameId}.playCount    // Total plays
gamehub.games.{gameId}.lastPlayed   // Last played timestamp
gamehub.history.recent              // Recently played game IDs (JSON array)
gamehub.favorites                   // Favorite game IDs (JSON array)
```

**API Functions:**

| Function | Purpose | Returns |
|----------|---------|---------|
| `getHighScore(gameId)` | Get high score | `number` |
| `setHighScore(gameId, score)` | Update high score (only if higher) | `void` |
| `getPlayCount(gameId)` | Get total plays | `number` |
| `incrementPlayCount(gameId)` | Increment play count | `void` |
| `getLastPlayed(gameId)` | Get last played timestamp | `number \| null` |
| `setLastPlayed(gameId)` | Set last played to now | `void` |
| `getRecentlyPlayed()` | Get recent game IDs | `string[]` |
| `addRecentlyPlayed(gameId)` | Add game to recent list (max 10) | `void` |
| `getFavorites()` | Get favorite game IDs | `string[]` |
| `addFavorite(gameId)` | Add game to favorites | `void` |
| `removeFavorite(gameId)` | Remove game from favorites | `void` |
| `isFavorite(gameId)` | Check if game is favorited | `boolean` |

**Migration:** Automatically migrates legacy storage format on first load

### 2.3 Execution Path: Game Card Click → Game Render

```
User Action: Click game card on home page
    ↓
Home.tsx: <Link to={`/play/${game.slug}`}>
    ↓
React Router: Navigate to /play/:slug
    ↓
App.tsx: Route matches /play/:slug → <GameSession />
    ↓
GameSession.tsx:
    1. Extract slug from URL params
    2. Call getGameBySlug(slug) from games.ts
    3. If game not found → show 404 page
    4. If game found:
       a. Call addRecentlyPlayed(game.id)
       b. Get high score: getHighScore(game.id)
       c. Get favorite status: isFavorite(game.id)
       d. Render GameSession shell:
          - Header with back button, high score, favorite icon
          - Full-bleed game content area (flex-1 min-h-0)
          - ErrorBoundary wrapper
          - Suspense fallback (loading state)
    ↓
GameSession.tsx: Render <GameComponent />
    ↓
Game Component (e.g., Snake.tsx):
    1. Import GameLayout wrapper
    2. Initialize game state (useState)
    3. Load high score from persistence
    4. Set up event listeners (keyboard, touch)
    5. Render game UI with GameLayout
    ↓
User sees: Game fully rendered and playable
```

---

### 2.4 Shared subsystems

| Module | Purpose |
|--------|---------|
| `lib/sound.ts` | Zero-dependency WebAudio engine (`click` · `move` · `success` · `gameover` · `highscore` · `tick`, plus `playTone`). Respects the Sound setting; lazily creates the AudioContext. |
| `lib/difficulty.ts` | `easy`/`medium`/`hard` presets exposing `time`/`speed`/`size`/`complexity`/`score` multipliers. `useDifficulty()` keeps every consumer in sync. |
| `lib/daily.ts` | Deterministic daily puzzles (`getDailySeed`), progress, current/longest streaks. |
| `lib/achievements.ts` | Achievement definitions + `checkAndUnlockAchievements()` (dispatches a `gamehub:achievements` event on unlock). |
| `lib/gameResult.ts` | `finishGame()` — the single entry point that records stats, daily progress, and achievements, and plays the end-of-game sound. |
| `hooks/useGameStatePersistence.ts` | Save/resume: `loadSavedState` + `useGameStatePersistence` (writes every 2 s, on `pagehide`, and on unmount; clears when the game finishes). |
| `hooks/useGridKeyNav.ts` | Arrow-key focus navigation between grid cell buttons, keeping Left/Right within a row. |
| `data/games.ts` | Registry of all 34 games (metadata + lazy `component`). |
| PWA | `public/manifest.webmanifest`, `public/sw.js` (offline shell), icons; registered in `main.tsx`. |
| Accessibility | Accessible `Modal` (focus trap + Escape), reduced-motion (setting + CSS), colorblind palette (`html.colorblind`), `aria-label`s. |

---
## 3. LAYOUT SHELL & TOUCH SYSTEM

### 3.1 GameSession (`src/features/game-session/GameSession.tsx`)

**Purpose:** Full-screen game session shell with viewport fitting

**Structure:**
```tsx
<div className="h-[100dvh] flex flex-col overflow-hidden bg-[#0a0a0a]">
  {/* Compact Header (56px) */}
  <div className="h-14 flex-shrink-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.08]">
    <div className="h-full px-4 flex items-center justify-between">
      <Link to={`/games/${game.slug}`}>
        <ChevronLeft /> <span>{game.name}</span>
      </Link>
      <div className="flex items-center gap-4">
        {highScore > 0 && <Trophy />} {highScore}
        {isFavorite && <Heart />}
      </div>
    </div>
  </div>

  {/* Full-Bleed Game Content */}
  <div className="flex-1 min-h-0 w-full">
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <GameComponent />
      </Suspense>
    </ErrorBoundary>
  </div>
</div>
```

**Key Features:**
- `h-[100dvh]`: Dynamic viewport height (prevents address bar jump on mobile)
- `flex-1 min-h-0`: Game content fills remaining space without overflow
- `backdrop-blur-xl`: Glassmorphic header effect
- `ErrorBoundary`: Catches game rendering errors
- `Suspense`: Shows loading state during lazy load

### 3.2 GameLayout (`src/components/ui/GameLayout.tsx`)

**Purpose:** Default HUD wrapper for games

**Structure:**
```tsx
<div className="w-full h-full flex flex-col items-center justify-between p-3 sm:p-5">
  {/* Compact HUD Bar */}
  <div className="w-full flex items-center justify-between gap-4 mb-3 sm:mb-5">
    <h1 className="text-lg sm:text-xl font-bold text-white truncate">
      {title}
    </h1>
    <div className="flex items-center gap-4 sm:gap-6 text-sm">
      {score !== undefined && (
        <div>
          <span className="text-gray-400">Score:</span>
          <span className="font-bold text-white tabular-nums">{score}</span>
        </div>
      )}
      {highScore !== undefined && (
        <div>
          <span className="text-gray-400">Best:</span>
          <span className="font-bold text-amber-400 tabular-nums">{highScore}</span>
        </div>
      )}
    </div>
    <div className="flex items-center gap-2">
      {onPause && <button><Pause /></button>}
      {onReset && <button><RotateCcw /></button>}
    </div>
  </div>

  {/* Main Content Area */}
  <div className="flex-1 min-h-0 w-full flex items-center justify-center">
    {children}
  </div>
</div>
```

**Props:**
```typescript
interface GameLayoutProps {
  title: string;              // Game title
  score?: number | string;    // Current score
  highScore?: number | string; // High score
  onReset?: () => void;       // Reset callback
  onPause?: () => void;       // Pause callback
  children: React.ReactNode;  // Game content
}
```

**Usage:** 29/34 games use GameLayout (all except custom layouts)

### 3.3 Touch Primitives (`src/components/ui/controls/`)

#### VirtualDPad (`VirtualDPad.tsx`)

**Purpose:** 4-way directional control for mobile

**Structure:**
```tsx
<div className="relative w-52 h-52" style={{ touchAction: 'none' }}>
  <button className="absolute top-0 left-1/2 -translate-x-1/2">
    {/* Up arrow */}
  </button>
  <button className="absolute bottom-0 left-1/2 -translate-x-1/2">
    {/* Down arrow */}
  </button>
  <button className="absolute left-0 top-1/2 -translate-y-1/2">
    {/* Left arrow */}
  </button>
  <button className="absolute right-0 top-1/2 -translate-y-1/2">
    {/* Right arrow */}
  </button>
</div>
```

**Touch Handling:**
```typescript
onTouchStart={(e) => {
  e.preventDefault();
  e.currentTarget.classList.add('scale-95', 'bg-white/20');
  onDirectionPress(direction);
}}
onTouchEnd={(e) => {
  e.preventDefault();
  e.currentTarget.classList.remove('scale-95', 'bg-white/20');
}}
```

**Props:**
```typescript
interface VirtualDPadProps {
  onDirectionPress: (direction: 'up' | 'down' | 'left' | 'right') => void;
  className?: string;
}
```

**Used by:** Snake, Sokoban

#### TouchActionButton (`TouchActionButton.tsx`)

**Purpose:** Touch-optimized action button

**Structure:**
```tsx
<button
  className="min-w-[48px] min-h-[48px] px-6 py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-xl"
  style={{ touchAction: 'manipulation' }}
>
  {icon && <span>{icon}</span>}
  <span>{label}</span>
</button>
```

**Props:**
```typescript
interface TouchActionButtonProps {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  className?: string;
}
```

**Variants:**
- `primary`: Blue background
- `secondary`: White/10 background
- `danger`: Red background

#### TouchControlContainer (`TouchControlContainer.tsx`)

**Purpose:** Mobile-only wrapper for touch controls

**Structure:**
```tsx
<div className="md:hidden fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none z-50">
  <div className="pointer-events-auto">
    {children}
  </div>
</div>
```

**Key Features:**
- `md:hidden`: Hidden on desktop (768px+)
- `fixed bottom-0`: Fixed to bottom of viewport
- `pointer-events-none`: Container doesn't block touches
- `pointer-events-auto`: Children receive touches
- `bg-gradient-to-t`: Gradient fade effect

**Used by:** Snake, Sokoban (with VirtualDPad)

---

## 4. GAME CATALOG (34 GAMES)

Every game is modular — `src/games/<slug>/<Game>.ts` (pure logic) + `<Game>.controls.tsx` (input) + `<Game>.ui.tsx` (view) + `index.ts`.
All 34 games support **difficulty** and **sound**; the table also flags **save/resume** and **hotseat** support.

| Game | Folder | Category | Save/Resume | Hotseat |
|------|--------|----------|:-----------:|:-------:|
| Snake | `snake/` | arcade | — | — |
| Breakout | `breakout/` | arcade | — | — |
| Flappy Bird | `flappy-bird/` | arcade | — | — |
| Pong | `pong/` | arcade | — | — |
| Tetris | `tetris/` | arcade | ✅ | — |
| Aim Trainer | `aim-trainer/` | arcade | — | — |
| Whack-a-Mole | `whack-a-mole/` | arcade | — | — |
| Reaction Timer | `reaction-timer/` | arcade | — | — |
| Typing Game | `typing-game/` | arcade | — | — |
| Idle Clicker | `idle-clicker/` | arcade | ✅ | — |
| 2048 | `game-2048/` | puzzle | ✅ | — |
| Minesweeper | `minesweeper/` | puzzle | ✅ | — |
| Sudoku | `sudoku/` | puzzle | ✅ | — |
| Lights Out | `lights-out/` | puzzle | ✅ | — |
| 15 Puzzle | `fifteen-puzzle/` | puzzle | ✅ | — |
| Sokoban | `sokoban/` | puzzle | ✅ | — |
| Mastermind | `mastermind/` | puzzle | ✅ | — |
| Memory Match | `memory-match/` | puzzle | ✅ | — |
| Word Search | `word-search/` | word | ✅ | — |
| Hangman | `hangman/` | word | ✅ | — |
| Wordle | `wordle/` | word | ✅ | — |
| Tic-Tac-Toe | `tic-tac-toe/` | board | ✅ | — |
| Connect Four | `connect-four/` | board | ✅ | ✅ |
| Gomoku | `gomoku/` | board | ✅ | — |
| Reversi | `reversi/` | board | ✅ | ✅ |
| Checkers | `checkers/` | board | ✅ | ✅ |
| Battleship | `battleship/` | board | ✅ | ✅ |
| Dots & Boxes | `dots-and-boxes/` | board | ✅ | — |
| Mancala | `mancala/` | board | ✅ | — |
| Solitaire | `solitaire/` | card | ✅ | — |
| Blackjack | `blackjack/` | card | — | — |
| Rock Paper Scissors | `rock-paper-scissors/` | classic | — | — |
| Simon Says | `simon-says/` | memory | — | — |
| Yahtzee | `yahtzee/` | classic | ✅ | — |

> **Hotseat** games also offer a vs-bot mode; **save/resume** games auto-save every 2 s (plus on page hide) and auto-clear once finished.
---

## 5. UNIVERSAL STYLING & DESIGN SYSTEM

### 5.1 Global Colors

**Background Colors:**
```css
--bg-primary: #0a0a0a;        /* Main background (dark) */
--bg-surface: #111111;        /* Card/surface background */
--bg-elevated: #171717;       /* Elevated surface */
--bg-light: #fafafa;          /* Light mode background */
```

**Text Colors:**
```css
--text-primary: #f5f5f5;      /* Primary text */
--text-secondary: #a1a1aa;    /* Secondary text */
--text-muted: #71717a;        /* Muted text */
```

**Accent Colors:**
```css
--accent-blue: #3b82f6;       /* Primary accent (buttons, links) */
--accent-amber: #f59e0b;      /* High scores, warnings */
--accent-green: #22c55e;      /* Success states */
--accent-red: #ef4444;        /* Error states */
```

**Button States:**
```css
/* Primary Button */
bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700

/* Secondary Button */
bg-white/5 hover:bg-white/10 active:bg-white/20

/* Danger Button */
bg-red-500 hover:bg-red-600 active:bg-red-700
```

### 5.2 Dark Mode & Glassmorphism

**Dark Mode (Default):**
```css
html.dark {
  color-scheme: dark;
  background-color: #0a0a0a;
  color: #f5f5f5;
}
```

**Glassmorphic Header:**
```css
bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.08]
```

**Glassmorphic Cards:**
```css
bg-white/5 backdrop-blur-xl border border-white/[0.08]
```

### 5.3 Global CSS Rules (`src/index.css`)

**Font:**
```css
font-family: 'Inter', system-ui, sans-serif;
```

**Focus States:**
```css
*:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}
```

**Scrollbar:**
```css
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}
```

**Selection:**
```css
::selection {
  background-color: rgba(59, 130, 246, 0.3);
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 5.4 Tailwind Configuration

**Custom Theme Variables:**
```css
@theme {
  --font-display: 'Inter', system-ui, sans-serif;
}
```

**Common Utility Classes:**
```css
/* Viewport fitting */
h-[100dvh]              /* Dynamic viewport height */
max-w-[min(90vw,60vh)]  /* Responsive max size */
aspect-square           /* Square aspect ratio */
aspect-video            /* 16:9 aspect ratio */

/* Touch optimization */
touch-action: manipulation  /* Prevent double-tap zoom */
touch-action: none          /* Prevent all touch gestures */
min-w-[48px] min-h-[48px]   /* Minimum touch target */

/* Flexbox layouts */
flex-1 min-h-0          /* Fill remaining space */
flex flex-col           /* Vertical flex */
items-center justify-center  /* Center content */

/* Responsive */
md:hidden               /* Hide on desktop */
sm:px-4                 /* Responsive padding */
```

---

## 6. ARCHITECTURE DIAGRAMS

### 6.1 Component Hierarchy

```
App
├── Router
│   ├── / → Home
│   │   └── GameCard (×30)
│   ├── /games → Library
│   │   └── GameCard (×30)
│   ├── /games/:slug → GamePreview
│   │   └── GameArtwork
│   ├── /play/:slug → GameSession
│   │   ├── ErrorBoundary
│   │   ├── Suspense
│   │   └── GameComponent
│   │       └── GameLayout
│   │           ├── HUD (score, high score, buttons)
│   │           └── Game Content
│   ├── /favorites → Favorites
│   ├── /history → History
│   ├── /leaderboard → Leaderboard
│   └── /settings → Settings
```

### 6.2 Data Flow

```
User Action
    ↓
React Component (useState/useEffect)
    ↓
Game Logic (pure functions)
    ↓
State Update (setState)
    ↓
React Re-render
    ↓
DOM Update
    ↓
Persistence Layer (if needed)
    ↓
localStorage
```

### 6.3 Persistence Flow

```
Game Component
    ↓
Import persistence functions
    ↓
Call getHighScore(gameId)
    ↓
localStorage.getItem('gamehub.games.{gameId}.highScore')
    ↓
Parse and return value
    ↓
Display in UI
```

---

## 7. CUSTOMIZATION GUIDE

### 7.1 Adding a New Game

1. **Create the game folder** (four files):
   ```
   src/games/my-game/
     MyGame.ts            # pure logic (no React)
     MyGame.controls.tsx  # input handling
     MyGame.ui.tsx        # React view
     index.ts             # export { default } from "./MyGame.ui"; export * from "./MyGame";
   ```

2. **Implement the view** (`.ui.tsx`):
   ```tsx
   import GameLayout from '../../components/ui/GameLayout';
   import { getHighScore, setHighScore } from '../../lib/persistence';
   import { useGameResult } from '../../hooks/useGameResult';

   export default function MyGame() {
     const [gameState, setGameState] = useState(createInitialState());
     const [highScore, setHighScoreState] = useState(getHighScore('my-game'));
     const { record } = useGameResult('my-game');

     useEffect(() => {
       if (gameState.isGameOver) {
         record({ won: gameState.isWon, score: gameState.score });
       }
     }, [gameState.isGameOver]);

     return (
       <GameLayout title="My Game" showDifficulty score={gameState.score} highScore={highScore} onReset={reset}>
         {/* board */}
       </GameLayout>
     );
   }
   ```

3. **Register it** in `src/data/games.ts` (add a `GameDefinition` object with `component: lazy(() => import('../games/my-game'))`).

4. **Optional capabilities:** add `useSound()` for effects, `useGameStatePersistence()` for save/resume, `useDifficulty()` for difficulty-scaled mechanics, and `useGridKeyNav()` for arrow-key grid navigation.
### 7.2 Modifying Game Styling

**Change button colors:**
```tsx
// In GameLayout.tsx or game component
<button className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700">
```

**Change background:**
```tsx
// In GameSession.tsx
<div className="h-[100dvh] flex flex-col overflow-hidden bg-[#0a0a0a]">
```

**Change glassmorphism:**
```tsx
// In GameSession.tsx header
<div className="bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.08]">
```

### 7.3 Adding Touch Controls

**Add VirtualDPad to a game:**
```tsx
import VirtualDPad from '../../components/ui/controls/VirtualDPad';
import TouchControlContainer from '../../components/ui/controls/TouchControlContainer';

const handleDirectionPress = (direction: 'up' | 'down' | 'left' | 'right') => {
  // Handle direction
};

return (
  <GameLayout>
    {/* Game content */}
    <TouchControlContainer>
      <VirtualDPad onDirectionPress={handleDirectionPress} />
    </TouchControlContainer>
  </GameLayout>
);
```

---

## 8. TROUBLESHOOTING

### Common Issues

**Issue:** Game not loading
- **Cause:** Lazy load failed
- **Solution:** Check game component path in `games.ts`

**Issue:** High score not saving
- **Cause:** Persistence layer error
- **Solution:** Check localStorage quota, verify gameId matches

**Issue:** Touch controls not working
- **Cause:** Missing `touch-action` property
- **Solution:** Add `style={{ touchAction: 'manipulation' }}` to buttons

**Issue:** Game overflowing viewport
- **Cause:** Missing viewport constraints
- **Solution:** Use `h-[100dvh]` and `flex-1 min-h-0`

---

## 9. PERFORMANCE NOTES

**Bundle Size:**
- Main bundle: ~362 KB (gzip: ~109 KB)
- CSS bundle: ~58 KB (gzip: ~10 KB)
- Game chunks: 1.7-5.6 KB each

**Optimization:**
- All games lazy-loaded
- Code-splitting per game
- Minimal dependencies
- Efficient state management

---

## 10. CONTACT & SUPPORT

**Documentation:** This file (`PROJECT_DOCS.md`)  
**Code Repository:** See project root  
**Issues:** Check game-specific implementations in `src/games/`

---

**End of Document**
