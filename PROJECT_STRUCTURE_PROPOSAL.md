# Project Structure Refactoring Proposal

## Overview

**Goal:** Split each game's monolithic file into focused, maintainable modules while introducing a shared difficulty system.

**Scope:** Documentation only - no code changes in this document.

---

## Current State (Snake Example)

**File:** `src/games/snake/Snake.tsx` (147 lines)

**Problems:**
- Game logic, UI rendering, and input handling all mixed together
- Difficulty parameters (GRID size, speed) hardcoded
- Hard to modify one aspect without touching others
- Each game would need its own difficulty config (not scalable)

---

## Proposed Structure

### Per-Game File Split

```
src/games/snake/
├── Snake.ts           # Pure game logic (no React)
├── Snake.ui.tsx       # React UI components
├── Snake.controls.tsx # Input handling (keyboard + touch)
└── index.ts          # Public exports
```

### Shared Difficulty System

**New file:** `src/lib/difficulty.ts`

```typescript
// Difficulty levels available to all games
export type Difficulty = 'easy' | 'normal' | 'hard';

// Generic difficulty settings that games can interpret
export interface DifficultySettings {
  // Time-based games: multiplier for time limits
  timeMultiplier: number;
  
  // Speed-based games: multiplier for game speed (lower = slower)
  speedMultiplier: number;
  
  // Size-based games: multiplier for grid/board size
  sizeMultiplier: number;
  
  // Complexity-based games: multiplier for complexity (e.g., more mines, more words)
  complexityMultiplier: number;
  
  // Score multiplier for balancing difficulty vs reward
  scoreMultiplier: number;
}

// Preset difficulty configurations
export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultySettings> = {
  easy: {
    timeMultiplier: 1.5,      // 50% more time
    speedMultiplier: 0.7,     // 30% slower
    sizeMultiplier: 0.8,      // 20% smaller
    complexityMultiplier: 0.7, // 30% less complex
    scoreMultiplier: 0.8,     // 20% less score
  },
  normal: {
    timeMultiplier: 1.0,
    speedMultiplier: 1.0,
    sizeMultiplier: 1.0,
    complexityMultiplier: 1.0,
    scoreMultiplier: 1.0,
  },
  hard: {
    timeMultiplier: 0.7,      // 30% less time
    speedMultiplier: 1.5,     // 50% faster
    sizeMultiplier: 1.3,      // 30% larger
    complexityMultiplier: 1.5, // 50% more complex
    scoreMultiplier: 1.5,     // 50% more score
  },
};

// Helper to get difficulty settings
export function getDifficultySettings(difficulty: Difficulty): DifficultySettings {
  return DIFFICULTY_PRESETS[difficulty];
}

// Helper to apply difficulty to a base value
export function applyDifficulty(
  baseValue: number,
  settings: DifficultySettings,
  type: 'time' | 'speed' | 'size' | 'complexity' | 'score'
): number {
  const multiplier = settings[`${type}Multiplier`];
  return Math.round(baseValue * multiplier);
}
```

---

## Before/After: Snake Game

### BEFORE (Current)

**Single file:** `src/games/snake/Snake.tsx` (147 lines)

Everything mixed together:
- Types (lines 9-10)
- Game logic (lines 12-18, 43-71)
- React component (lines 20-146)
- State management (lines 21-29)
- Keyboard controls (lines 31-41)
- Touch controls (lines 93-99)
- UI rendering (lines 101-145)
- Hardcoded GRID = 20 (line 7)
- Hardcoded speed = 150ms (line 69)

---

### AFTER (Proposed)

#### 1. `src/games/snake/Snake.ts` - Pure Game Logic

```typescript
// Pure game logic - no React, no UI, no input handling

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };

export interface GameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  isRunning: boolean;
  isGameOver: boolean;
}

export interface SnakeConfig {
  gridSize: number;
  speed: number; // milliseconds per tick
}

// Generate food at random position not occupied by snake
export function generateFood(snake: Position[], gridSize: number): Position {
  let pos: Position;
  do {
    pos = { 
      x: Math.floor(Math.random() * gridSize), 
      y: Math.floor(Math.random() * gridSize) 
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

// Create initial game state
export function createInitialState(gridSize: number): GameState {
  const initialSnake = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
  return {
    snake: initialSnake,
    food: generateFood(initialSnake, gridSize),
    direction: 'RIGHT',
    score: 0,
    isRunning: false,
    isGameOver: false,
  };
}

// Check if position is valid (within bounds and not colliding with snake)
export function isValidPosition(pos: Position, snake: Position[], gridSize: number): boolean {
  if (pos.x < 0 || pos.x >= gridSize || pos.y < 0 || pos.y >= gridSize) {
    return false;
  }
  if (snake.some(s => s.x === pos.x && s.y === pos.y)) {
    return false;
  }
  return true;
}

// Update game state for one tick
export function updateGameState(state: GameState, config: SnakeConfig): GameState {
  if (!state.isRunning || state.isGameOver) {
    return state;
  }

  const head = { ...state.snake[0] };
  
  // Move head based on direction
  switch (state.direction) {
    case 'UP': head.y--; break;
    case 'DOWN': head.y++; break;
    case 'LEFT': head.x--; break;
    case 'RIGHT': head.x++; break;
  }

  // Check collision
  if (!isValidPosition(head, state.snake, config.gridSize)) {
    return { ...state, isGameOver: true, isRunning: false };
  }

  const newSnake = [head, ...state.snake];
  
  // Check if food eaten
  if (head.x === state.food.x && head.y === state.food.y) {
    return {
      ...state,
      snake: newSnake,
      food: generateFood(newSnake, config.gridSize),
      score: state.score + 10,
    };
  } else {
    // Remove tail
    newSnake.pop();
    return {
      ...state,
      snake: newSnake,
    };
  }
}

// Change direction (prevents 180-degree turns)
export function changeDirection(current: Direction, newDir: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };
  
  if (opposites[current] === newDir) {
    return current; // Ignore opposite direction
  }
  
  return newDir;
}
```

**Responsibilities:**
- Type definitions
- Pure functions for game logic
- No React, no side effects
- Easy to test in isolation

---

#### 2. `src/games/snake/Snake.controls.tsx` - Input Handling

```typescript
import { useEffect } from 'react';
import { Direction, changeDirection } from './Snake';

// Keyboard controls hook
export function useKeyboardControls(
  onDirectionChange: (dir: Direction) => void,
  isEnabled: boolean
) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let newDir: Direction | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newDir = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newDir = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newDir = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newDir = 'RIGHT';
          break;
      }
      
      if (newDir) {
        e.preventDefault();
        onDirectionChange(newDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDirectionChange, isEnabled]);
}

// Touch controls handler
export function handleTouchDirection(
  currentDir: Direction,
  newDir: 'up' | 'down' | 'left' | 'right',
  onDirectionChange: (dir: Direction) => void
) {
  const directionMap = {
    up: 'UP' as Direction,
    down: 'DOWN' as Direction,
    left: 'LEFT' as Direction,
    right: 'RIGHT' as Direction,
  };
  
  const newDirection = directionMap[newDir];
  const validDirection = changeDirection(currentDir, newDirection);
  
  if (validDirection !== currentDir) {
    onDirectionChange(validDirection);
  }
}
```

**Responsibilities:**
- Keyboard event listeners
- Touch control handlers
- Direction validation
- No game logic, no UI rendering

---

#### 3. `src/games/snake/Snake.ui.tsx` - React UI Components

```typescript
import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import VirtualDPad from '../../components/ui/controls/VirtualDPad';
import TouchControlContainer from '../../components/ui/controls/TouchControlContainer';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { getDifficultySettings, applyDifficulty, Difficulty } from '../../lib/difficulty';
import {
  GameState,
  SnakeConfig,
  createInitialState,
  updateGameState,
  generateFood,
} from './Snake';
import { useKeyboardControls, handleTouchDirection } from './Snake.controls';

// Base configuration (before difficulty adjustment)
const BASE_GRID_SIZE = 20;
const BASE_SPEED = 150; // milliseconds

export default function SnakeGame() {
  // Difficulty state (could be lifted to global settings later)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const difficultySettings = getDifficultySettings(difficulty);
  
  // Apply difficulty to base config
  const config: SnakeConfig = {
    gridSize: applyDifficulty(BASE_GRID_SIZE, difficultySettings, 'size'),
    speed: applyDifficulty(BASE_SPEED, difficultySettings, 'speed'),
  };

  // Game state
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(config.gridSize));
  const [highScore, setHighScoreState] = useState(getHighScore('snake'));
  
  // Ref for direction to avoid stale closures in interval
  const directionRef = useRef(gameState.direction);
  directionRef.current = gameState.direction;

  // Keyboard controls
  useKeyboardControls(
    useCallback((newDir) => {
      setGameState(prev => ({ ...prev, direction: newDir }));
    }, []),
    gameState.isRunning && !gameState.isGameOver
  );

  // Game loop
  useEffect(() => {
    if (!gameState.isRunning || gameOver) return;

    const interval = setInterval(() => {
      setGameState(prev => updateGameState(prev, config));
    }, config.speed);

    return () => clearInterval(interval);
  }, [gameState.isRunning, gameState.isGameOver, config.speed]);

  // High score update
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0) {
      const currentHigh = getHighScore('snake');
      if (gameState.score > currentHigh) {
        setHighScore('snake', gameState.score);
        setHighScoreState(gameState.score);
      }
    }
  }, [gameState.isGameOver, gameState.score]);

  // Game controls
  const startGame = () => {
    setGameState(prev => ({ ...prev, isRunning: true }));
  };

  const resetGame = () => {
    setGameState(createInitialState(config.gridSize));
  };

  const handleTouchDirectionPress = (dir: 'up' | 'down' | 'left' | 'right') => {
    handleTouchDirection(gameState.direction, dir, (newDir) => {
      setGameState(prev => ({ ...prev, direction: newDir }));
    });
  };

  return (
    <GameLayout 
      title="Snake" 
      score={gameState.score} 
      highScore={highScore} 
      onReset={resetGame}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {/* Difficulty selector */}
        <div className="flex gap-2">
          {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setDifficulty(diff);
                resetGame();
              }}
              className={`px-4 py-2 rounded-lg ${
                difficulty === diff
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>

        {/* Start/Play Again button */}
        {!gameState.isRunning && !gameState.isGameOver && (
          <button 
            onClick={startGame}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg"
          >
            Start
          </button>
        )}
        {gameState.isGameOver && (
          <button 
            onClick={resetGame}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg"
          >
            Play Again
          </button>
        )}
        
        {/* Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 border border-gray-700 overflow-hidden">
            <div 
              className="grid h-full w-full"
              style={{ 
                gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${config.gridSize}, 1fr)`
              }}
            >
              {Array.from({ length: config.gridSize * config.gridSize }).map((_, idx) => {
                const x = idx % config.gridSize;
                const y = Math.floor(idx / config.gridSize);
                const isSnake = gameState.snake.some(s => s.x === x && s.y === y);
                const isFood = gameState.food.x === x && gameState.food.y === y;
                return (
                  <div
                    key={idx}
                    className={`${
                      isSnake ? 'bg-green-500' : isFood ? 'bg-red-500' : 'bg-gray-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Touch Controls */}
        <TouchControlContainer>
          <div className="flex justify-center">
            <VirtualDPad onDirectionPress={handleTouchDirectionPress} />
          </div>
        </TouchControlContainer>
      </div>
    </GameLayout>
  );
}
```

**Responsibilities:**
- React component and state management
- UI rendering
- Integration with GameLayout
- Difficulty selection UI
- Game loop orchestration
- High score persistence

---

#### 4. `src/games/snake/index.ts` - Public Exports

```typescript
export { default } from './Snake.ui';
export * from './Snake';
```

---

## What Stays Shared (Untouched)

These files remain unchanged:

1. **`src/lib/persistence.ts`** - High score storage
2. **`src/data/games.ts`** - Game registry
3. **`src/App.tsx`** - Routing
4. **`src/components/ui/GameLayout.tsx`** - Game layout wrapper
5. **`src/lib/difficulty.ts`** - NEW shared difficulty system

---

## Benefits of This Structure

### 1. Separation of Concerns
- **Snake.ts**: Pure logic, easy to test, no React dependency
- **Snake.controls.tsx**: Input handling isolated
- **Snake.ui.tsx**: UI rendering isolated
- **index.ts**: Clean public API

### 2. Shared Difficulty System
- One source of truth for difficulty levels
- Consistent difficulty across all games
- Easy to add new difficulty levels
- Games interpret difficulty settings according to their mechanics

### 3. Maintainability
- Change game speed? Edit `Snake.ts` or adjust `BASE_SPEED`
- Change controls? Edit `Snake.controls.tsx`
- Change UI? Edit `Snake.ui.tsx`
- Change difficulty? Edit `src/lib/difficulty.ts`

### 4. Testability
- Pure game logic in `Snake.ts` can be unit tested without React
- Controls can be tested independently
- UI can be tested with mocked game state

### 5. Reusability
- Game logic could be reused for different UIs (e.g., 3D Snake)
- Controls could be reused for other grid-based games
- Difficulty system works for all games

---

## Migration Strategy

### Phase 1: Create New Files
1. Create `Snake.ts` with extracted game logic
2. Create `Snake.controls.tsx` with extracted input handling
3. Create `Snake.ui.tsx` with React component
4. Create `index.ts` with exports

### Phase 2: Update Imports
1. Update `src/data/games.ts` to import from `src/games/snake/index.ts`
2. Verify routing still works

### Phase 3: Remove Old File
1. Delete old `Snake.tsx`
2. Run tests to verify everything works

### Phase 4: Apply to Other Games
1. Repeat process for each game
2. Each game can be migrated independently

---

## Example: How Difficulty Works

### Snake Game
```typescript
const BASE_GRID_SIZE = 20;
const BASE_SPEED = 150;

const settings = getDifficultySettings('hard');
const gridSize = applyDifficulty(BASE_GRID_SIZE, settings, 'size'); // 26
const speed = applyDifficulty(BASE_SPEED, settings, 'speed'); // 100ms (faster)
```

### Minesweeper Game (Future Example)
```typescript
const BASE_ROWS = 9;
const BASE_COLS = 9;
const BASE_MINES = 10;

const settings = getDifficultySettings('hard');
const rows = applyDifficulty(BASE_ROWS, settings, 'size'); // 12
const cols = applyDifficulty(BASE_COLS, settings, 'size'); // 12
const mines = applyDifficulty(BASE_MINES, settings, 'complexity'); // 15
```

### Breakout Game (Future Example)
```typescript
const BASE_BALL_SPEED = 5;
const BASE_PADDLE_WIDTH = 80;

const settings = getDifficultySettings('hard');
const ballSpeed = applyDifficulty(BASE_BALL_SPEED, settings, 'speed'); // 7.5
const paddleWidth = applyDifficulty(BASE_PADDLE_WIDTH, settings, 'size'); // 64 (smaller)
```

---

## Summary

**Files Changed:**
- Split `src/games/snake/Snake.tsx` → 4 files
- Add `src/lib/difficulty.ts` (shared)

**Files Unchanged:**
- All shared infrastructure (persistence, routing, registry, GameLayout)

**Result:**
- Cleaner, more maintainable code
- Consistent difficulty across games
- Easy to modify individual aspects
- Better testability
- No breaking changes to existing functionality

---

## Next Steps

1. Review and approve this proposal
2. Implement for Snake game as proof of concept
3. Test thoroughly
4. Apply pattern to remaining 29 games
5. Add difficulty selector UI to other games
