// Pure game logic - no React, no UI, no input handling

export const GRID_SIZE = 3;
export const GAME_DURATION = 30;
export const MOLE_SPAWN_INTERVAL = 800;
export const TIMER_INTERVAL = 1000;

export interface GameState {
  moles: boolean[];
  score: number;
  time: number;
  isRunning: boolean;
  isGameOver: boolean;
}

export interface WhackAMoleConfig {
  gridSize: number;
  duration: number;
  spawnInterval: number;
}

export function createInitialState(duration: number = GAME_DURATION): GameState {
  return {
    moles: Array(GRID_SIZE * GRID_SIZE).fill(false),
    score: 0,
    time: duration,
    isRunning: false,
    isGameOver: false,
  };
}

export function spawnMoles(): boolean[] {
  const newMoles = Array(GRID_SIZE * GRID_SIZE).fill(false);
  const count = 1 + Math.floor(Math.random() * 2); // 1-2 moles
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * GRID_SIZE * GRID_SIZE);
    newMoles[idx] = true;
  }
  return newMoles;
}

export function whackMole(moles: boolean[], idx: number): { moles: boolean[]; success: boolean } {
  if (!moles[idx]) {
    return { moles, success: false };
  }
  const newMoles = [...moles];
  newMoles[idx] = false;
  return { moles: newMoles, success: true };
}

export function decrementTime(time: number): { time: number; gameOver: boolean } {
  if (time <= 1) {
    return { time: 0, gameOver: true };
  }
  return { time: time - 1, gameOver: false };
}
