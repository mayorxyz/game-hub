# Project Structure Proposal: Self-Contained Game Modules

## Step 1: Verification - GameLayout Usage

### Grep Command Output
```bash
grep -L "GameLayout" src/games/*/*.tsx
```

**Result:** No output (empty)

### Analysis
All 30 games currently import and use `GameLayout`:
- Total game files: 30
- Files importing GameLayout: 30
- Files NOT importing GameLayout: 0

**Conclusion:** 100% of games use GameLayout. Previous reports of 19 or 29 were incorrect.

---

## Step 2: Proposed Structure

### Current Structure (Monolithic)
```
src/games/snake/
  Snake.tsx  # Contains: game logic + UI + styling + layout wrapper
```

**Problems:**
- All concerns mixed in one file
- Cannot customize layout without touching game logic
- No way to configure difficulty/parameters
- Changes to one game risk affecting shared patterns
- No clear separation of concerns

---

### Proposed Structure (Modular)
```
src/games/snake/
  Snake.tsx           # Game logic only (pure game state, no UI)
  Snake.config.ts     # Difficulty levels, tunable parameters
  Snake.styles.ts     # Scoped styling (Tailwind classes, custom CSS)
  Snake.layout.tsx    # Optional custom layout (falls back to default)
  Snake.controls.tsx  # Optional custom controls (keyboard/touch mapping)
  Snake.ui.tsx        # Game-specific UI components (HUD, menus)
  index.ts            # Public API export
```

---

## Step 3: File Responsibilities

### 1. `Snake.tsx` - Core Game Logic
**Purpose:** Pure game logic, state management, rules
**Contains:**
- Game state types
- State transitions
- Win/lose conditions
- Score calculation
- Game loop (if applicable)

**Does NOT contain:**
- React components
- Styling
- Layout
- Difficulty config

**Example:**
```typescript
// Snake.tsx
export type GameState = {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  status: 'playing' | 'gameover' | 'won';
};

export function createInitialState(config: SnakeConfig): GameState {
  return {
    snake: [{ x: 10, y: 10 }],
    food: generateFood(config.gridSize),
    direction: 'RIGHT',
    score: 0,
    status: 'playing',
  };
}

export function updateState(state: GameState, action: GameAction, config: SnakeConfig): GameState {
  // Pure game logic
}

export function checkWinCondition(state: GameState, config: SnakeConfig): boolean {
  // Win logic
}
```

---

### 2. `Snake.config.ts` - Configuration & Difficulty
**Purpose:** Difficulty levels, tunable parameters, game constants
**Contains:**
- Difficulty presets (easy/medium/hard)
- Game parameters (speed, grid size, etc.)
- Default values

**Example:**
```typescript
// Snake.config.ts
export type Difficulty = 'easy' | 'medium' | 'hard';

export type SnakeConfig = {
  difficulty: Difficulty;
  gridSize: number;
  initialSpeed: number;
  speedIncrement: number;
  maxSpeed: number;
  wrapAround: boolean;
};

export const DIFFICULTY_PRESETS: Record<Difficulty, SnakeConfig> = {
  easy: {
    difficulty: 'easy',
    gridSize: 15,
    initialSpeed: 200,
    speedIncrement: 5,
    maxSpeed: 100,
    wrapAround: true,
  },
  medium: {
    difficulty: 'medium',
    gridSize: 20,
    initialSpeed: 150,
    speedIncrement: 10,
    maxSpeed: 80,
    wrapAround: false,
  },
  hard: {
    difficulty: 'hard',
    gridSize: 25,
    initialSpeed: 100,
    speedIncrement: 15,
    maxSpeed: 50,
    wrapAround: false,
  },
};

export function getConfig(difficulty: Difficulty): SnakeConfig {
  return DIFFICULTY_PRESETS[difficulty];
}
```

**Usage:**
```typescript
// In Snake.ui.tsx or Snake.tsx
import { getConfig } from './Snake.config';

const config = getConfig('medium'); // or from user settings
const initialState = createInitialState(config);
```

---

### 3. `Snake.styles.ts` - Scoped Styling
**Purpose:** Game-specific styling, Tailwind classes, custom CSS
**Contains:**
- Tailwind class strings
- Custom CSS-in-JS (if needed)
- Theme overrides

**Example:**
```typescript
// Snake.styles.ts
export const styles = {
  container: 'w-full h-full flex flex-col items-center justify-center bg-gray-900',
  grid: 'relative border-2 border-gray-700',
  snake: 'bg-green-500 rounded-sm',
  food: 'bg-red-500 rounded-full',
  score: 'text-2xl font-bold text-white',
  gameOver: 'text-red-500 text-3xl font-bold',
};

export function getGridStyle(gridSize: number): React.CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
    aspectRatio: '1',
  };
}
```

---

### 4. `Snake.layout.tsx` - Custom Layout (Optional)
**Purpose:** Override default GameLayout with game-specific layout
**Falls back to:** `src/components/ui/GameLayout.tsx` if not provided

**Example:**
```typescript
// Snake.layout.tsx
import React from 'react';
import { styles } from './Snake.styles';

interface SnakeLayoutProps {
  children: React.ReactNode;
  score: number;
  highScore: number;
  onReset: () => void;
}

export function SnakeLayout({ children, score, highScore, onReset }: SnakeLayoutProps) {
  return (
    <div className={styles.container}>
      {/* Custom HUD */}
      <div className="flex gap-4 mb-4">
        <div className={styles.score}>Score: {score}</div>
        <div className="text-gray-400">Best: {highScore}</div>
      </div>
      
      {/* Game content */}
      {children}
      
      {/* Custom controls */}
      <button onClick={onReset} className="mt-4 px-4 py-2 bg-indigo-600 rounded">
        Reset
      </button>
    </div>
  );
}
```

**Fallback Behavior:**
```typescript
// In GameSession.tsx or game wrapper
import { SnakeLayout } from './Snake.layout'; // Optional import
import DefaultGameLayout from '../../components/ui/GameLayout';

const Layout = SnakeLayout || DefaultGameLayout;
```

---

### 5. `Snake.controls.tsx` - Custom Controls (Optional)
**Purpose:** Game-specific input handling (keyboard, touch, gamepad)
**Contains:**
- Keyboard mappings
- Touch gestures
- Control schemes

**Example:**
```typescript
// Snake.controls.tsx
import { useEffect } from 'react';

export function useSnakeControls(
  onDirectionChange: (dir: Direction) => void,
  enabled: boolean
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          onDirectionChange('UP');
          break;
        case 'ArrowDown':
        case 's':
          onDirectionChange('DOWN');
          break;
        // ...
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDirectionChange, enabled]);
}

export function useSnakeTouchControls(
  onDirectionChange: (dir: Direction) => void,
  enabled: boolean
) {
  // Touch/swipe handling
}
```

---

### 6. `Snake.ui.tsx` - Game UI Components
**Purpose:** React components for rendering the game
**Contains:**
- Game board/grid
- Score display
- Game over screen
- Difficulty selector

**Example:**
```typescript
// Snake.ui.tsx
import React, { useState, useEffect } from 'react';
import { GameState, createInitialState, updateState } from './Snake';
import { getConfig, Difficulty } from './Snake.config';
import { styles, getGridStyle } from './Snake.styles';
import { useSnakeControls } from './Snake.controls';
import { SnakeLayout } from './Snake.layout';
import { getHighScore, setHighScore } from '../../lib/persistence';

export default function SnakeGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const config = getConfig(difficulty);
  const [state, setState] = useState<GameState>(() => createInitialState(config));
  const [highScore, setHighScoreState] = useState(getHighScore('snake'));

  // Game loop
  useEffect(() => {
    if (state.status !== 'playing') return;
    
    const interval = setInterval(() => {
      setState(prev => updateState(prev, { type: 'TICK' }, config));
    }, config.initialSpeed);

    return () => clearInterval(interval);
  }, [state.status, config]);

  // Controls
  useSnakeControls((dir) => {
    setState(prev => updateState(prev, { type: 'CHANGE_DIRECTION', direction: dir }, config));
  }, state.status === 'playing');

  // High score
  useEffect(() => {
    if (state.status === 'gameover' && state.score > highScore) {
      setHighScore('snake', state.score);
      setHighScoreState(state.score);
    }
  }, [state.status, state.score, highScore]);

  const handleReset = () => {
    setState(createInitialState(config));
  };

  return (
    <SnakeLayout score={state.score} highScore={highScore} onReset={handleReset}>
      {/* Difficulty selector */}
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      {/* Game grid */}
      <div style={getGridStyle(config.gridSize)} className={styles.grid}>
        {state.snake.map((pos, i) => (
          <div key={i} className={styles.snake} style={{ gridColumn: pos.x + 1, gridRow: pos.y + 1 }} />
        ))}
        <div className={styles.food} style={{ gridColumn: state.food.x + 1, gridRow: state.food.y + 1 }} />
      </div>

      {/* Game over */}
      {state.status === 'gameover' && (
        <div className={styles.gameOver}>Game Over!</div>
      )}
    </SnakeLayout>
  );
}
```

---

### 7. `index.ts` - Public API
**Purpose:** Clean exports for the game module
**Contains:**
- Default export (main game component)
- Named exports (types, configs, utilities)

**Example:**
```typescript
// index.ts
export { default } from './Snake.ui';
export type { GameState, SnakeConfig, Difficulty } from './Snake';
export { DIFFICULTY_PRESETS, getConfig } from './Snake.config';
```

---

## Step 4: What Stays Shared (Untouched)

### Shared Systems (Do NOT Modify)
1. **`src/lib/persistence.ts`** - Centralized localStorage
   - Why: Single source of truth, prevents conflicts
   - All games use this for high scores, play counts

2. **`src/data/games.ts`** - Game registry
   - Why: Central routing, discovery, metadata
   - Contains lazy imports, categories, descriptions

3. **`src/App.tsx`** - Routing
   - Why: Centralized route definitions
   - Maps `/play/:slug` to GameSession

4. **`src/index.css`** - Global styles
   - Why: Consistent theme, focus states, reduced motion
   - Base styles that all games inherit

5. **`src/components/ui/GameLayout.tsx`** - Default layout
   - Why: Fallback for games without custom layout
   - Provides standard HUD (score, high score, reset)

6. **`src/features/game-session/GameSession.tsx`** - Game shell
   - Why: Viewport fitting, error boundary, suspense
   - Wraps all games consistently

---

## Step 5: Before/After Example (Snake)

### Before (Current)
```
src/games/snake/
  Snake.tsx  # 147 lines - everything mixed together
```

**Snake.tsx contains:**
- Game state types (lines 9-10)
- Game logic (lines 12-18, 43-80)
- React component (lines 20-146)
- Styling (inline Tailwind classes)
- Layout (GameLayout wrapper)
- Controls (keyboard + touch)
- Difficulty (hardcoded grid size)

**Problems:**
- Cannot change difficulty without editing game logic
- Cannot customize layout without touching UI
- Cannot reuse game logic in different context
- All changes require editing same file

---

### After (Proposed)
```
src/games/snake/
  Snake.tsx           # 80 lines - pure game logic
  Snake.config.ts     # 50 lines - difficulty & parameters
  Snake.styles.ts     # 30 lines - scoped styling
  Snake.layout.tsx    # 40 lines - custom layout (optional)
  Snake.controls.tsx  # 60 lines - input handling
  Snake.ui.tsx        # 100 lines - React UI components
  index.ts            # 5 lines - exports
```

**Benefits:**
- ✅ Edit difficulty without touching game logic
- ✅ Customize layout without touching UI
- ✅ Reuse game logic in different contexts
- ✅ Clear separation of concerns
- ✅ Easy to test each piece independently
- ✅ Can override any piece without affecting others

---

## Step 6: Migration Strategy

### Phase 1: Extract Config (Low Risk)
1. Create `Snake.config.ts` with difficulty presets
2. Update `Snake.tsx` to import config
3. No UI changes, just parameterize existing values

### Phase 2: Extract Styles (Low Risk)
1. Create `Snake.styles.ts` with Tailwind classes
2. Update `Snake.tsx` to import styles
3. No logic changes, just styling

### Phase 3: Extract Controls (Medium Risk)
1. Create `Snake.controls.tsx` with input hooks
2. Update `Snake.tsx` to use control hooks
3. Test keyboard and touch input

### Phase 4: Extract Layout (Medium Risk)
1. Create `Snake.layout.tsx` with custom layout
2. Update `GameSession.tsx` to detect custom layouts
3. Test layout fallback behavior

### Phase 5: Extract UI (High Risk)
1. Create `Snake.ui.tsx` with React components
2. Rename `Snake.tsx` to pure logic file
3. Update imports in registry
4. Full regression testing

---

## Step 7: Implementation Checklist

### For Each Game:
- [ ] Create `GameName.config.ts` with difficulty presets
- [ ] Create `GameName.styles.ts` with scoped styling
- [ ] Create `GameName.controls.tsx` with input handling
- [ ] Create `GameName.layout.tsx` (optional, if custom layout needed)
- [ ] Create `GameName.ui.tsx` with React components
- [ ] Refactor `GameName.tsx` to pure game logic
- [ ] Create `index.ts` with clean exports
- [ ] Update game registry if needed
- [ ] Test all difficulty levels
- [ ] Test custom layout (if provided)
- [ ] Test fallback to default layout
- [ ] Verify high score persistence
- [ ] Verify keyboard controls
- [ ] Verify touch controls
- [ ] Test on mobile viewport
- [ ] Test on desktop viewport

---

## Step 8: Risk Assessment

### Low Risk
- Extracting config (no UI changes)
- Extracting styles (no logic changes)
- Adding new files (no breaking changes)

### Medium Risk
- Extracting controls (input handling changes)
- Custom layouts (GameSession detection logic)

### High Risk
- Splitting UI from logic (major refactor)
- Changing game registry (affects routing)

### Mitigation
- Keep `GameName.tsx` as fallback during migration
- Test each phase independently
- Maintain backward compatibility
- Gradual rollout (one game at a time)

---

## Step 9: Success Criteria

### Functional Requirements
- ✅ Each game can be edited independently
- ✅ Difficulty can be changed without code changes
- ✅ Custom layouts work when provided
- ✅ Default layout works when custom not provided
- ✅ All 30 games continue working
- ✅ High scores persist correctly
- ✅ Controls work on desktop and mobile

### Non-Functional Requirements
- ✅ No performance regression
- ✅ No bundle size increase (>5%)
- ✅ No breaking changes to existing games
- ✅ Clear documentation for each file
- ✅ Easy to add new games

---

## Step 10: Open Questions

1. **Should all games have custom layouts?**
   - Recommendation: No, only games that need unique HUD/controls
   - Most games can use default GameLayout

2. **Should difficulty be user-selectable or hardcoded?**
   - Recommendation: User-selectable via in-game menu
   - Store preference in localStorage

3. **Should controls be customizable?**
   - Recommendation: Yes, allow key rebinding
   - Store bindings in localStorage

4. **Should games share any UI components?**
   - Recommendation: Yes, shared components in `src/components/ui/`
   - Game-specific components stay in game folder

5. **How to handle games with unique mechanics?**
   - Recommendation: Allow game-specific files (e.g., `Snake.powerups.ts`)
   - Keep core structure consistent

---

## Conclusion

This proposal transforms the project from a monolithic structure where each game is a single large file, to a modular structure where each game is a self-contained module with clear separation of concerns.

**Key Benefits:**
- Independent editing of each game
- Configurable difficulty without code changes
- Optional custom layouts with fallback
- Clear separation of logic, UI, styling, controls
- Easy to test and maintain

**Key Risks:**
- Migration effort (30 games)
- Potential breaking changes
- Increased file count

**Recommendation:**
Start with one game (Snake) as a proof of concept, validate the structure, then roll out to other games gradually.

---

**Document Version:** 1.0  
**Date:** 2024  
**Status:** Proposal (Not Implemented)
