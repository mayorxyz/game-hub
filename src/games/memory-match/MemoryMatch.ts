// Pure game logic - no React, no UI, no input handling
import { mulberry32 } from '../../lib/random';

export const EMOJIS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎸', '🎺', '🃏', '🎰'];

export interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

export interface GameState {
  cards: Card[];
  selected: number[];
  moves: number;
  isWon: boolean;
}

export interface MemoryMatchConfig {
  pairs: number;
}

export function createCards(seed?: number, pairs: number = EMOJIS.length): Card[] {
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;
  const pool = EMOJIS.slice(0, Math.max(2, Math.min(pairs, EMOJIS.length)));
  const arr = [...pool, ...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
}

export function checkMatch(cards: Card[], idx1: number, idx2: number): boolean {
  return cards[idx1].emoji === cards[idx2].emoji;
}

export function flipCard(cards: Card[], idx: number): Card[] {
  return cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
}

export function matchCards(cards: Card[], idx1: number, idx2: number): Card[] {
  return cards.map((c, i) => (i === idx1 || i === idx2) ? { ...c, matched: true } : c);
}

export function unflipCards(cards: Card[], idx1: number, idx2: number): Card[] {
  return cards.map((c, i) => (i === idx1 || i === idx2) ? { ...c, flipped: false } : c);
}

export function checkAllMatched(cards: Card[]): boolean {
  return cards.every(c => c.matched);
}

export function createInitialState(seed?: number, pairs: number = EMOJIS.length): GameState {
  const cards = createCards(seed, pairs);
  return {
    cards,
    selected: [],
    moves: 0,
    isWon: false,
  };
}
