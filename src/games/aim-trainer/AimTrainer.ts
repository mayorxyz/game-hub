// Pure game logic - no React, no UI, no input handling

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 400;
export const TIME_LIMIT = 30;
export const SPAWN_INTERVAL = 800;

export interface Target {
  x: number;
  y: number;
  r: number;
  id: number;
}

export interface GameState {
  targets: Target[];
  score: number;
  timeLeft: number;
  isRunning: boolean;
  misses: number;
}

export interface AimTrainerConfig {
  canvasWidth: number;
  canvasHeight: number;
  timeLimit: number;
  spawnInterval: number;
}

export function createInitialState(): GameState {
  return {
    targets: [],
    score: 0,
    timeLeft: TIME_LIMIT,
    isRunning: false,
    misses: 0,
  };
}

export function spawnTarget(idCounter: number): Target {
  const r = 15 + Math.random() * 20;
  return {
    x: r + Math.random() * (CANVAS_WIDTH - 2 * r),
    y: r + Math.random() * (CANVAS_HEIGHT - 2 * r),
    r,
    id: idCounter,
  };
}

export function hitTarget(targets: Target[], id: number): Target[] {
  return targets.filter(t => t.id !== id);
}

export function calculateAccuracy(score: number, misses: number): number {
  return score + misses > 0 ? Math.round((score / (score + misses)) * 100) : 0;
}

export function decrementTime(timeLeft: number): { timeLeft: number; gameOver: boolean } {
  if (timeLeft <= 1) {
    return { timeLeft: 0, gameOver: true };
  }
  return { timeLeft: timeLeft - 1, gameOver: false };
}
