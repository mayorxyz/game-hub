// Pure game logic for Wordle - no React, no UI, no input handling

export const WORDS = [
  'REACT', 'WORLD', 'CRANE', 'SLATE', 'TRACE', 'ARISE', 'AUDIO', 'STARE', 'ROAST', 'PIZZA',
  'GHOST', 'BLAZE', 'FROST', 'DREAM', 'LIGHT', 'MUSIC', 'OCEAN', 'STORM', 'FLAME', 'STONE'
];
export const WORD_LEN = 5;
export const MAX_GUESSES = 6;

export type LetterState = 'correct' | 'present' | 'absent' | 'empty';

export interface WordleState {
  target: string;
  guesses: string[];
  currentGuess: string;
  isGameOver: boolean;
  isWon: boolean;
}

export function evaluateGuess(guess: string, target: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LEN).fill('absent');
  const targetArr = target.split('');
  const guessArr = guess.split('');
  
  // First pass: mark correct letters
  for (let i = 0; i < WORD_LEN; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct';
      targetArr[i] = '#';
      guessArr[i] = '*';
    }
  }
  
  // Second pass: mark present letters
  for (let i = 0; i < WORD_LEN; i++) {
    if (guessArr[i] === '*') continue;
    const idx = targetArr.indexOf(guessArr[i]);
    if (idx !== -1) {
      result[i] = 'present';
      targetArr[idx] = '#';
    }
  }
  
  return result;
}

export function getRandomWord(): string {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}

export function createInitialState(seed?: number): WordleState {
  return {
    target: seed !== undefined ? WORDS[seed % WORDS.length] : getRandomWord(),
    guesses: [],
    currentGuess: '',
    isGameOver: false,
    isWon: false,
  };
}

export function addLetter(state: WordleState, letter: string): WordleState {
  if (state.isGameOver || state.currentGuess.length >= WORD_LEN) return state;
  return {
    ...state,
    currentGuess: state.currentGuess + letter.toUpperCase(),
  };
}

export function removeLetter(state: WordleState): WordleState {
  if (state.isGameOver || state.currentGuess.length === 0) return state;
  return {
    ...state,
    currentGuess: state.currentGuess.slice(0, -1),
  };
}

export function submitGuess(state: WordleState, maxGuesses: number = MAX_GUESSES): WordleState {
  if (state.currentGuess.length !== WORD_LEN || state.isGameOver) return state;
  
  const newGuesses = [...state.guesses, state.currentGuess];
  const isWon = state.currentGuess === state.target;
  const isGameOver = isWon || newGuesses.length >= maxGuesses;
  
  return {
    ...state,
    guesses: newGuesses,
    currentGuess: '',
    isGameOver,
    isWon,
  };
}

export function resetGame(seed?: number): WordleState {
  return createInitialState(seed);
}

export function getRows(state: WordleState, maxGuesses: number = MAX_GUESSES): { letters: string[]; states: LetterState[] }[] {
  const evaluations = state.guesses.map(g => evaluateGuess(g, state.target));
  
  return Array.from({ length: maxGuesses }, (_, i) => {
    if (i < state.guesses.length) {
      return { letters: state.guesses[i].split(''), states: evaluations[i] };
    }
    if (i === state.guesses.length) {
      return {
        letters: state.currentGuess.split('').concat(Array(WORD_LEN - state.currentGuess.length).fill('')),
        states: Array(WORD_LEN).fill('empty') as LetterState[],
      };
    }
    return { letters: Array(WORD_LEN).fill(''), states: Array(WORD_LEN).fill('empty') as LetterState[] };
  });
}

export function getLetterState(state: WordleState, letter: string): LetterState {
  const evaluations = state.guesses.map(g => evaluateGuess(g, state.target));
  
  for (let i = state.guesses.length - 1; i >= 0; i--) {
    const ev = evaluations[i];
    const idx = state.guesses[i].indexOf(letter);
    if (idx !== -1) {
      return ev[idx];
    }
  }
  
  return 'empty';
}
