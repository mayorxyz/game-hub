// Input handling for Mastermind - no React UI, just control logic

import { MastermindState, Color, MAX_ATTEMPTS, addColorToGuess, removeColorFromGuess, submitGuess, clearCurrentGuess } from './Mastermind';

export function handleColorSelect(
  state: MastermindState,
  color: Color,
  onStateChange: (newState: MastermindState) => void
): void {
  if (state.isGameOver) return;
  
  const newState = addColorToGuess(state, color);
  onStateChange(newState);
}

export function handleUndo(
  state: MastermindState,
  onStateChange: (newState: MastermindState) => void
): void {
  if (state.isGameOver) return;
  
  const newState = removeColorFromGuess(state);
  onStateChange(newState);
}

export function handleSubmit(
  state: MastermindState,
  onStateChange: (newState: MastermindState) => void,
  maxAttempts: number = MAX_ATTEMPTS
): void {
  if (state.isGameOver) return;
  if (state.currentGuess.length !== state.secretCode.length) return;
  
  const newState = submitGuess(state, maxAttempts);
  onStateChange(newState);
}

export function handleClear(
  state: MastermindState,
  onStateChange: (newState: MastermindState) => void
): void {
  if (state.isGameOver) return;
  
  const newState = clearCurrentGuess(state);
  onStateChange(newState);
}
