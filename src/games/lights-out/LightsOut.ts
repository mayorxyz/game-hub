// Pure game logic - no React, no UI, no input handling

export const GRID_SIZE = 5;

export type Board = number[][];

export interface GameState {
  board: Board;
  moves: number;
  isWon: boolean;
}

export interface LightsOutConfig {
  gridSize: number;
  initialMoves: number;
}

export function toggle(board: Board, r: number, c: number): Board {
  const n = board.map(row => [...row]);
  const size = board.length;
  const f = (r: number, c: number) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      n[r][c] = n[r][c] ? 0 : 1;
    }
  };
  f(r, c);
  f(r - 1, c);
  f(r + 1, c);
  f(r, c - 1);
  f(r, c + 1);
  return n;
}

export function createPuzzle(size: number = GRID_SIZE): Board {
  const b: Board = Array.from({ length: size }, () => Array(size).fill(0));
  // Scale the scramble with the board area (8 toggles for the default 5x5 board).
  const toggles = Math.round(size * size * 0.32);
  for (let i = 0; i < toggles; i++) {
    const r = Math.floor(Math.random() * size);
    const c = Math.floor(Math.random() * size);
    const f = toggle(b, r, c);
    for (let ri = 0; ri < size; ri++) {
      for (let ci = 0; ci < size; ci++) {
        b[ri][ci] = f[ri][ci];
      }
    }
  }
  return b;
}

export function checkWin(board: Board): boolean {
  return board.every(row => row.every(v => v === 0));
}

export function createInitialState(size: number = GRID_SIZE): GameState {
  const board = createPuzzle(size);
  return {
    board,
    moves: 0,
    isWon: checkWin(board),
  };
}
