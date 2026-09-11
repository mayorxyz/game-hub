# Game Hub — System Architecture & Component Dossier

**Version:** 1.0  
**Last Updated:** 2024  
**Purpose:** Developer reference manual for navigation, understanding, and customization

---

## 1. FILE & DIRECTORY TREE

```
src/
├── App.tsx                              # Main router with lazy-loaded routes
├── main.tsx                             # React entry point
├── index.css                            # Global styles, Tailwind imports, theme variables
│
├── components/
│   ├── app/
│   │   └── AppShell.tsx                 # Application shell with navigation
│   ├── game/
│   │   └── GameArtwork.tsx              # CSS-based game thumbnail generator
│   └── ui/
│       ├── Button.tsx                   # Reusable button component
│       ├── GameCard.tsx                 # Game card for library/home display
│       ├── GameLayout.tsx               # Default game HUD wrapper
│       ├── Modal.tsx                    # Modal dialog component
│       └── controls/
│           ├── VirtualDPad.tsx          # 4-way directional touch control
│           ├── TouchActionButton.tsx    # Touch-optimized action button
│           └── TouchControlContainer.tsx # Mobile-only touch control wrapper
│
├── data/
│   └── games.ts                         # Game registry (30 games)
│
├── features/
│   ├── favorites/
│   │   └── Favorites.tsx                # Favorites management page
│   ├── game-preview/
│   │   └── GamePreview.tsx              # Game info/preview page
│   ├── game-session/
│   │   └── GameSession.tsx              # Game session shell (100dvh viewport)
│   ├── history/
│   │   └── History.tsx                  # Recently played games page
│   ├── home/
│   │   └── Home.tsx                     # Home page with featured games
│   ├── leaderboard/
│   │   └── Leaderboard.tsx              # High scores leaderboard
│   ├── library/
│   │   └── Library.tsx                  # Game library browser
│   └── settings/
│       └── Settings.tsx                 # Settings page
│
├── games/                               # 30 individual game implementations
│   ├── aim-trainer/AimTrainer.tsx
│   ├── battleship/Battleship.tsx
│   ├── blackjack/Blackjack.tsx
│   ├── breakout/Breakout.tsx
│   ├── checkers/Checkers.tsx
│   ├── connect-four/ConnectFour.tsx
│   ├── fifteen-puzzle/FifteenPuzzle.tsx
│   ├── flappy-bird/FlappyBird.tsx
│   ├── game-2048/Game2048.tsx
│   ├── gomoku/Gomoku.tsx
│   ├── hangman/Hangman.tsx
│   ├── idle-clicker/IdleClicker.tsx
│   ├── lights-out/LightsOut.tsx
│   ├── mancala/Mancala.tsx
│   ├── memory-match/MemoryMatch.tsx
│   ├── minesweeper/Minesweeper.tsx
│   ├── pong/Pong.tsx
│   ├── reaction-timer/ReactionTimer.tsx
│   ├── reversi/Reversi.tsx
│   ├── rock-paper-scissors/RockPaperScissors.tsx
│   ├── simon-says/SimonSays.tsx
│   ├── snake/Snake.tsx
│   ├── sokoban/Sokoban.tsx
│   ├── solitaire/Solitaire.tsx
│   ├── sudoku/Sudoku.tsx
│   ├── tic-tac-toe/TicTacToe.tsx
│   ├── typing-game/TypingGame.tsx
│   ├── whack-a-mole/WhackAMole.tsx
│   ├── word-search/WordSearch.tsx
│   └── wordle/Wordle.tsx
│
├── hooks/
│   └── useSettings.ts                   # Theme/settings hook
│
├── lib/
│   ├── persistence.ts                   # Centralized persistence layer
│   └── storage.ts                       # Legacy storage wrapper
│
└── types/
    └── game.ts                          # TypeScript type definitions
```

### Key Folder Responsibilities

| Folder | Responsibility |
|--------|----------------|
| `components/ui/` | Reusable UI components (buttons, cards, layouts) |
| `components/ui/controls/` | Touch control primitives for mobile |
| `data/` | Game registry and metadata |
| `features/` | Feature-specific pages (home, library, settings) |
| `games/` | Individual game implementations (30 games) |
| `hooks/` | Custom React hooks |
| `lib/` | Utility libraries (persistence, storage) |
| `types/` | TypeScript type definitions |

---

## 2. CORE INFRASTRUCTURE & DATA FLOW

### 2.1 Game Registry (`src/data/games.ts`)

**Purpose:** Central registry of all 30 games with metadata

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

**Usage:** 29/30 games use GameLayout (all except custom layouts)

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

## 4. 30-GAME MATRIX CATALOG

### Canvas/Arcade Games (10)

| Game | File Path | Uses GameLayout | Rendering | Styling | Input |
|------|-----------|----------------|-----------|---------|-------|
| Snake | `src/games/snake/Snake.tsx` | Yes | CSS Grid | Tailwind | Keyboard, Virtual D-Pad |
| Breakout | `src/games/breakout/Breakout.tsx` | Yes | HTML5 Canvas | Tailwind | Mouse, Touch |
| Flappy Bird | `src/games/flappy-bird/FlappyBird.tsx` | Yes | HTML5 Canvas | Tailwind | Keyboard, Touch |
| Pong | `src/games/pong/Pong.tsx` | Yes | HTML5 Canvas | Tailwind | Mouse, Touch |
| Aim Trainer | `src/games/aim-trainer/AimTrainer.tsx` | Yes | React Flex/DOM | Tailwind | Mouse, Touch |
| Whack-a-Mole | `src/games/whack-a-mole/WhackAMole.tsx` | Yes | React Flex/DOM | Tailwind | Mouse, Touch |
| 15 Puzzle | `src/games/fifteen-puzzle/FifteenPuzzle.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Sokoban | `src/games/sokoban/Sokoban.tsx` | Yes | CSS Grid | Tailwind | Keyboard, Virtual D-Pad |
| Lights Out | `src/games/lights-out/LightsOut.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Reaction Timer | `src/games/reaction-timer/ReactionTimer.tsx` | Yes | React Flex/DOM | Tailwind | Mouse, Touch |

### Grid/Board Games (10)

| Game | File Path | Uses GameLayout | Rendering | Styling | Input |
|------|-----------|----------------|-----------|---------|-------|
| 2048 | `src/games/game-2048/Game2048.tsx` | Yes | CSS Grid | Tailwind | Keyboard, Touch Swipe |
| Minesweeper | `src/games/minesweeper/Minesweeper.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Sudoku | `src/games/sudoku/Sudoku.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Tic-Tac-Toe | `src/games/tic-tac-toe/TicTacToe.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Connect Four | `src/games/connect-four/ConnectFour.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Memory Match | `src/games/memory-match/MemoryMatch.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Reversi | `src/games/reversi/Reversi.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Gomoku | `src/games/gomoku/Gomoku.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Checkers | `src/games/checkers/Checkers.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Battleship | `src/games/battleship/Battleship.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |

### Card/Word/Turn-Based Games (10)

| Game | File Path | Uses GameLayout | Rendering | Styling | Input |
|------|-----------|----------------|-----------|---------|-------|
| Hangman | `src/games/hangman/Hangman.tsx` | Yes | React Flex/DOM | Tailwind | Keyboard, Touch Buttons |
| Wordle | `src/games/wordle/Wordle.tsx` | Yes | React Flex/DOM | Tailwind | Keyboard, Touch Buttons |
| Word Search | `src/games/word-search/WordSearch.tsx` | Yes | CSS Grid | Tailwind | Mouse, Touch |
| Typing Game | `src/games/typing-game/TypingGame.tsx` | Yes | React Flex/DOM | Tailwind | Keyboard |
| Idle Clicker | `src/games/idle-clicker/IdleClicker.tsx` | Yes | React Flex/DOM | Tailwind | Mouse, Touch |
| Rock Paper Scissors | `src/games/rock-paper-scissors/RockPaperScissors.tsx` | Yes | React Flex/DOM | Tailwind | Mouse, Touch Buttons |
| Mancala | `src/games/mancala/Mancala.tsx` | Yes | React Flex/DOM | Tailwind | Mouse, Touch |
| Blackjack | `src/games/blackjack/Blackjack.tsx` | Yes | React Flex/DOM | Tailwind | Mouse, Touch Buttons |
| Solitaire | `src/games/solitaire/Solitaire.tsx` | Yes | React Flex/DOM | Tailwind | Mouse, Touch |
| Simon Says | `src/games/simon-says/SimonSays.tsx` | Yes | React Flex/DOM | Tailwind | Mouse, Touch Buttons |

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

1. **Create game folder:**
   ```
   src/games/my-game/MyGame.tsx
   ```

2. **Implement game component:**
   ```tsx
   import GameLayout from '../../components/ui/GameLayout';
   import { getHighScore, setHighScore } from '../../lib/persistence';
   
   export default function MyGame() {
     const [score, setScore] = useState(0);
     const [highScore, setHighScoreState] = useState(getHighScore('my-game'));
     
     const reset = () => { /* reset logic */ };
     
     return (
       <GameLayout title="My Game" score={score} highScore={highScore} onReset={reset}>
         {/* Game content */}
       </GameLayout>
     );
   }
   ```

3. **Register in games.ts:**
   ```typescript
   {
     id: 'my-game',
     name: 'My Game',
     slug: 'my-game',
     // ... other metadata
     component: lazy(() => import('../games/my-game/MyGame')),
   }
   ```

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
