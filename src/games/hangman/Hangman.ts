// Pure game logic for Hangman - no React, no UI, no input handling

export const WORDS = [
  'JAVASCRIPT', 'PYTHON', 'ELEPHANT', 'GUITAR', 'MOUNTAIN',
  'BUTTERFLY', 'CHOCOLATE', 'ADVENTURE', 'DINOSAUR', 'UNIVERSE'
];

export const MAX_WRONG_GUESSES = 6;

export interface HangmanState {
  word: string;
  guessedLetters: Set<string>;
  wrongGuesses: number;
  isWon: boolean;
  isLost: boolean;
  streak: number;
}

export function createInitialState(): HangmanState {
  return {
    word: getRandomWord(),
    guessedLetters: new Set(),
    wrongGuesses: 0,
    isWon: false,
    isLost: false,
    streak: 0,
  };
}

export function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function guessLetter(state: HangmanState, letter: string): HangmanState {
  if (state.isWon || state.isLost || state.guessedLetters.has(letter)) {
    return state;
  }

  const newGuessed = new Set(state.guessedLetters);
  newGuessed.add(letter);

  const isCorrect = state.word.includes(letter);
  const newWrongGuesses = isCorrect ? state.wrongGuesses : state.wrongGuesses + 1;
  
  const isWon = state.word.split('').every(l => newGuessed.has(l));
  const isLost = newWrongGuesses >= MAX_WRONG_GUESSES;
  
  let newStreak = state.streak;
  if (isWon) {
    newStreak = state.streak + 1;
  } else if (isLost) {
    newStreak = 0;
  }

  return {
    ...state,
    guessedLetters: newGuessed,
    wrongGuesses: newWrongGuesses,
    isWon,
    isLost,
    streak: newStreak,
  };
}

export function resetGame(state: HangmanState): HangmanState {
  return {
    word: getRandomWord(),
    guessedLetters: new Set(),
    wrongGuesses: 0,
    isWon: false,
    isLost: false,
    streak: state.isLost ? 0 : state.streak,
  };
}

export function getDisplayWord(state: HangmanState): string {
  return state.word
    .split('')
    .map(l => state.guessedLetters.has(l) || state.isLost ? l : '_')
    .join(' ');
}
