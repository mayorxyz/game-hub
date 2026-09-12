// Pure game logic - no React, no UI, no input handling
import { mulberry32 } from '../../lib/random';

export const BOARD_SIZE = 4;
export const INITIAL_TILES = 2;

export type Board = number[][];

export interface GameState {
  board: Board;
  score: number;
  isGameOver: boolean;
}

export interface Game2048Config {
  boardSize: number;
}

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

export function addRandom(board: Board, rng: () => number = Math.random): Board {
  const empty: [number, number][] = [];
  board.forEach((row, r) => row.forEach((v, c) => v === 0 && empty.push([r, c])));
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(rng() * empty.length)];
  const nb = board.map(row => [...row]);
  nb[r][c] = rng() < 0.9 ? 2 : 4;
  return nb;
}

export function slide(row: number[]): { row: number[]; score: number } {
  let score = 0;
  const filtered = row.filter(v => v !== 0);
  const merged: number[] = [];
  for (let i = 0; i < filtered.length; i++) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }
  while (merged.length < BOARD_SIZE) merged.push(0);
  return { row: merged, score };
}

export function move(board: Board, dir: 'left' | 'right' | 'up' | 'down'): { board: Board; score: number; moved: boolean } {
  let total = 0;
  let moved = false;
  const nb = board.map(r => [...r]);

  if (dir === 'left') {
    for (let i = 0; i < BOARD_SIZE; i++) {
      const { row, score } = slide(nb[i]);
      if (nb[i].some((v, j) => v !== row[j])) moved = true;
      nb[i] = row;
      total += score;
    }
  } else if (dir === 'right') {
    for (let i = 0; i < BOARD_SIZE; i++) {
      const { row, score } = slide([...nb[i]].reverse());
      const reversed = row.reverse();
      if (nb[i].some((v, j) => v !== reversed[j])) moved = true;
      nb[i] = reversed;
      total += score;
    }
  } else if (dir === 'up') {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col = nb.map(r => r[c]);
      const { row, score } = slide(col);
      if (col.some((v, j) => v !== row[j])) moved = true;
      row.forEach((v, r) => { nb[r][c] = v; });
      total += score;
    }
  } else {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const col = nb.map(r => r[c]).reverse();
      const { row, score } = slide(col);
      const reversed = row.reverse();
      const orig = nb.map(r => r[c]);
      if (orig.some((v, j) => v !== reversed[j])) moved = true;
      reversed.forEach((v, r) => { nb[r][c] = v; });
      total += score;
    }
  }

  return { board: nb, score: total, moved };
}

export function hasValidMoves(board: Board): boolean {
  // Check for empty cells
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === 0) return true;
    }
  }
  // Check for possible merges
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const val = board[r][c];
      if (r < BOARD_SIZE - 1 && board[r + 1][c] === val) return true;
      if (c < BOARD_SIZE - 1 && board[r][c + 1] === val) return true;
    }
  }
  return false;
}

export function createInitialState(seed?: number, initialTiles: number = INITIAL_TILES): GameState {
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;
  let board = createBoard();
  for (let i = 0; i < initialTiles; i++) {
    board = addRandom(board, rng);
  }
  return {
    board,
    score: 0,
    isGameOver: false,
  };
}
