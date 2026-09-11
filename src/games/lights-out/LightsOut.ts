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
  const f = (r: number, c: number) => {
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
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

export function createPuzzle(): Board {
  const b: Board = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  for (let i = 0; i < 8; i++) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    const f = toggle(b, r, c);
    for (let ri = 0; ri < GRID_SIZE; ri++) {
      for (let ci = 0; ci < GRID_SIZE; ci++) {
        b[ri][ci] = f[ri][ci];
      }
    }
  }
  return b;
}

export function checkWin(board: Board): boolean {
  return board.every(row => row.every(v => v === 0));
}

export function createInitialState(): GameState {
  const board = createPuzzle();
  return {
    board,
    moves: 0,
    isWon: checkWin(board),
  };
}
