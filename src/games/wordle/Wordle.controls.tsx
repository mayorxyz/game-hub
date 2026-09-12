// Input handling for Wordle - no React UI, just control logic

import { WordleState, MAX_GUESSES, addLetter, removeLetter, submitGuess } from './Wordle';

export function handleLetterInput(
  state: WordleState,
  letter: string,
  onStateChange: (newState: WordleState) => void
): void {
  const newState = addLetter(state, letter);
  onStateChange(newState);
}

export function handleBackspace(
  state: WordleState,
  onStateChange: (newState: WordleState) => void
): void {
  const newState = removeLetter(state);
  onStateChange(newState);
}

export function handleSubmit(
  state: WordleState,
  onStateChange: (newState: WordleState) => void,
  maxGuesses: number = MAX_GUESSES
): void {
  const newState = submitGuess(state, maxGuesses);
  onStateChange(newState);
}
