// Input handling for Hangman - no React UI, just control logic

import { HangmanState, guessLetter } from './Hangman';

export function handleLetterGuess(
  state: HangmanState,
  letter: string,
  onGuess: (newState: HangmanState) => void
): void {
  if (state.isWon || state.isLost || state.guessedLetters.has(letter)) return;
  
  const newState = guessLetter(state, letter);
  onGuess(newState);
}
