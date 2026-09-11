// Pure game logic - no React, no UI, no input handling

export type Choice = 'rock' | 'paper' | 'scissors';
export type Result = 'win' | 'lose' | 'draw';

export const CHOICES: Choice[] = ['rock', 'paper', 'scissors'];
export const EMOJIS: Record<Choice, string> = { rock: '✊', paper: '✋', scissors: '✌️' };

export interface GameState {
  history: { player: Choice; bot: Choice }[];
  lastResult: { player: Choice; bot: Choice; result: string } | null;
  score: { wins: number; losses: number; draws: number };
}

export interface RockPaperScissorsConfig {
  choices: Choice[];
}

export function createInitialState(): GameState {
  return {
    history: [],
    lastResult: null,
    score: { wins: 0, losses: 0, draws: 0 },
  };
}

export function botChoice(history: { player: Choice; bot: Choice }[]): Choice {
  if (history.length < 3) return CHOICES[Math.floor(Math.random() * 3)];
  const counts: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
  history.forEach(h => counts[h.player]++);
  const predicted = (Object.entries(counts) as [Choice, number][]).sort((a, b) => b[1] - a[1])[0][0];
  const counter: Record<Choice, Choice> = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
  return counter[predicted];
}

export function getResult(player: Choice, bot: Choice): Result {
  if (player === bot) return 'draw';
  if ((player === 'rock' && bot === 'scissors') || 
      (player === 'paper' && bot === 'rock') || 
      (player === 'scissors' && bot === 'paper')) {
    return 'win';
  }
  return 'lose';
}

export function getResultText(result: Result): string {
  if (result === 'win') return 'You win!';
  if (result === 'lose') return 'Bot wins!';
  return 'Draw!';
}
