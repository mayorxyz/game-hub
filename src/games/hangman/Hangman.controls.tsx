// Input handling for Hangman - no React UI, just control logic

import { HangmanState, guessLetter, MAX_WRONG_GUESSES } from './Hangman';

export function handleLetterGuess(
  state: HangmanState,
  letter: string,
  onGuess: (newState: HangmanState) => void,
  maxWrong: number = MAX_WRONG_GUESSES
): void {
  if (state.isWon || state.isLost || state.guessedLetters.has(letter)) return;
  
  const newState = guessLetter(state, letter, maxWrong);
  onGuess(newState);
}
