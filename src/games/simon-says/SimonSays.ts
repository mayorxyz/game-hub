// Pure game logic - no React, no UI, no input handling

export const COLORS = ['red', 'blue', 'green', 'yellow'];
export const SEQUENCE_DELAY = 600;
export const ACTIVE_DURATION = 400;
export const NEXT_SEQUENCE_DELAY = 800;
export const PLAYER_ACTIVE_DURATION = 200;

export interface GameState {
  sequence: string[];
  playerIdx: number;
  activeColor: string | null;
  isShowing: boolean;
  isGameOver: boolean;
  score: number;
  isStarted: boolean;
}

export interface SimonSaysConfig {
  colors: string[];
  sequenceDelay: number;
  activeDuration: number;
}

export function createInitialState(): GameState {
  return {
    sequence: [],
    playerIdx: 0,
    activeColor: null,
    isShowing: false,
    isGameOver: false,
    score: 0,
    isStarted: false,
  };
}

export function generateNextSequence(currentSequence: string[]): string[] {
  const nextColor = COLORS[Math.floor(Math.random() * COLORS.length)];
  return [...currentSequence, nextColor];
}

export function checkPlayerInput(sequence: string[], playerIdx: number, pressedColor: string): { correct: boolean; roundComplete: boolean } {
  const correct = pressedColor === sequence[playerIdx];
  const roundComplete = correct && playerIdx === sequence.length - 1;
  return { correct, roundComplete };
}
