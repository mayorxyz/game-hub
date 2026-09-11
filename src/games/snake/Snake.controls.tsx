// Input handling for Snake - no React UI, just control logic

import { SnakeState, Direction, changeDirection } from './Snake';

export function handleDirectionInput(
  state: SnakeState,
  direction: Direction,
  onStateChange: (newState: SnakeState) => void
): void {
  const newState = changeDirection(state, direction);
  onStateChange(newState);
}

export function handleStartGame(
  state: SnakeState,
  onStateChange: (newState: SnakeState) => void
): void {
  if (!state.isRunning && !state.isGameOver) {
    onStateChange({ ...state, isRunning: true });
  }
}

export function handleResetGame(
  gridSize: number,
  onStateChange: (newState: SnakeState) => void
): void {
  const newState = {
    snake: [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }],
    food: { x: 0, y: 0 }, // Will be regenerated
    direction: 'RIGHT' as Direction,
    score: 0,
    isRunning: false,
    isGameOver: false,
  };
  onStateChange(newState);
}
