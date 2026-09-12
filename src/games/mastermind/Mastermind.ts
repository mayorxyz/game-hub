// Pure game logic for Mastermind - no React, no UI, no input handling

export const CODE_LENGTH = 4;
export const MAX_ATTEMPTS = 10;
export const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as const;
export type Color = typeof COLORS[number];

export interface Guess {
  code: Color[];
  blackPegs: number; // Correct color and position
  whitePegs: number; // Correct color, wrong position
}

export interface MastermindState {
  secretCode: Color[];
  guesses: Guess[];
  currentGuess: Color[];
  isGameOver: boolean;
  isWon: boolean;
}

export function createInitialState(): MastermindState {
  const secretCode: Color[] = [];
  for (let i = 0; i < CODE_LENGTH; i++) {
    secretCode.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
  }
  
  return {
    secretCode,
    guesses: [],
    currentGuess: [],
    isGameOver: false,
    isWon: false,
  };
}

export function addColorToGuess(state: MastermindState, color: Color): MastermindState {
  if (state.isGameOver || state.currentGuess.length >= CODE_LENGTH) return state;
  
  return {
    ...state,
    currentGuess: [...state.currentGuess, color],
  };
}

export function removeColorFromGuess(state: MastermindState): MastermindState {
  if (state.isGameOver || state.currentGuess.length === 0) return state;
  
  return {
    ...state,
    currentGuess: state.currentGuess.slice(0, -1),
  };
}

export function submitGuess(state: MastermindState): MastermindState {
  if (state.isGameOver || state.currentGuess.length !== CODE_LENGTH) return state;
  
  // Calculate pegs
  let blackPegs = 0;
  let whitePegs = 0;
  
  const secretCopy: (Color | null)[] = [...state.secretCode];
  const guessCopy: (Color | null)[] = [...state.currentGuess];
  
  // First pass: count black pegs (exact matches)
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] === secretCopy[i]) {
      blackPegs++;
      secretCopy[i] = null; // Mark as used
      guessCopy[i] = null;
    }
  }
  
  // Second pass: count white pegs (color matches in wrong position)
  for (let i = 0; i < CODE_LENGTH; i++) {
    if (guessCopy[i] === null) continue;
    const idx = secretCopy.indexOf(guessCopy[i]);
    if (idx !== -1) {
      whitePegs++;
      secretCopy[idx] = null; // Mark as used
    }
  }
  
  const guess: Guess = {
    code: state.currentGuess,
    blackPegs,
    whitePegs,
  };
  
  const newGuesses = [...state.guesses, guess];
  const isWon = blackPegs === CODE_LENGTH;
  const isGameOver = isWon || newGuesses.length >= MAX_ATTEMPTS;
  
  return {
    ...state,
    guesses: newGuesses,
    currentGuess: [],
    isGameOver,
    isWon,
  };
}

export function clearCurrentGuess(state: MastermindState): MastermindState {
  if (state.isGameOver) return state;
  return {
    ...state,
    currentGuess: [],
  };
}
