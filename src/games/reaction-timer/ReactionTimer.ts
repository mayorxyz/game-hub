// Pure game logic for Reaction Timer - no React, no UI, no input handling

export type Phase = 'waiting' | 'ready' | 'go' | 'result' | 'too-early';

export interface ReactionTimerState {
  phase: Phase;
  startTime: number;
  reactionTime: number;
  bestTime: number;
}

export function createInitialState(bestTime: number = Infinity): ReactionTimerState {
  return {
    phase: 'waiting',
    startTime: 0,
    reactionTime: 0,
    bestTime,
  };
}

export function getDelay(timeMultiplier: number = 1): number {
  return (1500 + Math.random() * 3000) * timeMultiplier;
}

export function calculateReactionTime(startTime: number): number {
  return Date.now() - startTime;
}

export function isTooEarly(phase: Phase): boolean {
  return phase === 'ready';
}

export function isReadyToStart(phase: Phase): boolean {
  return phase === 'waiting' || phase === 'result' || phase === 'too-early';
}

export function isNewBest(reactionTime: number, bestTime: number): boolean {
  return reactionTime < bestTime;
}
