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
