// Pure game logic for Typing Game - no React, no UI, no input handling

export const TEXTS = [
  'The quick brown fox jumps over the lazy dog near the riverbank.',
  'Programming is the art of telling a computer what to do in detail.',
  'Every great developer you know got there by solving problems they were unqualified to solve.',
  'Code is like humor when you have to explain it its bad.',
  'The best error message is the one that never shows up.',
];

export interface TypingGameState {
  text: string;
  input: string;
  startTime: number;
  wpm: number;
  isFinished: boolean;
  isStarted: boolean;
}

export function getRandomText(): string {
  return TEXTS[Math.floor(Math.random() * TEXTS.length)];
}

export function createInitialState(): TypingGameState {
  return {
    text: '',
    input: '',
    startTime: 0,
    wpm: 0,
    isFinished: false,
    isStarted: false,
  };
}

export function startGame(state: TypingGameState): TypingGameState {
  return {
    ...state,
    text: getRandomText(),
    input: '',
    startTime: Date.now(),
    wpm: 0,
    isFinished: false,
    isStarted: true,
  };
}

export function calculateWPM(startTime: number, input: string): number {
  const elapsed = (Date.now() - startTime) / 60000; // Convert to minutes
  const words = input.trim().split(/\s+/).length;
  if (elapsed > 0) {
    return Math.round(words / elapsed);
  }
  return 0;
}

export function calculateAccuracy(input: string, text: string): number {
  if (input.length === 0) return 100;
  
  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === text[i]) correct++;
  }
  
  return Math.round((correct / input.length) * 100);
}

export function updateInput(state: TypingGameState, input: string): TypingGameState {
  if (state.isFinished) return state;
  
  const isFinished = input === state.text;
  let wpm = state.wpm;
  
  if (isFinished) {
    const elapsed = (Date.now() - state.startTime) / 60000;
    const words = state.text.trim().split(/\s+/).length;
    wpm = Math.round(words / elapsed);
  } else {
    wpm = calculateWPM(state.startTime, input);
  }
  
  return {
    ...state,
    input,
    wpm,
    isFinished,
  };
}

export function resetGame(): TypingGameState {
  return createInitialState();
}
