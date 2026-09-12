// Pure game logic for Snake - no React, no UI, no input handling

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };

export interface SnakeState {
  snake: Position[];
  food: Position;
  direction: Direction;
  score: number;
  isRunning: boolean;
  isGameOver: boolean;
  scoreMultiplier: number;
}

export interface SnakeConfig {
  gridSize: number;
  speed: number;
  scoreMultiplier: number;
}

export function createInitialState(gridSize: number = 20, scoreMultiplier: number = 1.0): SnakeState {
  const initialSnake = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
  return {
    snake: initialSnake,
    food: generateFood(initialSnake, gridSize),
    direction: 'RIGHT',
    score: 0,
    isRunning: false,
    isGameOver: false,
    scoreMultiplier,
  };
}

export function generateFood(snake: Position[], gridSize: number): Position {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

export function moveSnake(state: SnakeState, gridSize: number): SnakeState {
  if (!state.isRunning || state.isGameOver) return state;

  const head = { ...state.snake[0] };

  switch (state.direction) {
    case 'UP':
      head.y--;
      break;
    case 'DOWN':
      head.y++;
      break;
    case 'LEFT':
      head.x--;
      break;
    case 'RIGHT':
      head.x++;
      break;
  }

  // Check wall collision
  if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
    return { ...state, isGameOver: true };
  }

  // Check self collision
  if (state.snake.some(s => s.x === head.x && s.y === head.y)) {
    return { ...state, isGameOver: true };
  }

  const newSnake = [head, ...state.snake];

  // Check food collision
  if (head.x === state.food.x && head.y === state.food.y) {
    return {
      ...state,
      snake: newSnake,
      food: generateFood(newSnake, gridSize),
      score: state.score + Math.round(10 * state.scoreMultiplier),
    };
  }

  // Remove tail
  newSnake.pop();

  return {
    ...state,
    snake: newSnake,
  };
}

export function changeDirection(state: SnakeState, newDirection: Direction): SnakeState {
  const opposites: Record<Direction, Direction> = {
    UP: 'DOWN',
    DOWN: 'UP',
    LEFT: 'RIGHT',
    RIGHT: 'LEFT',
  };

  if (opposites[state.direction] === newDirection) {
    return state;
  }

  return {
    ...state,
    direction: newDirection,
  };
}

export function resetGame(gridSize: number = 20): SnakeState {
  return createInitialState(gridSize);
}
