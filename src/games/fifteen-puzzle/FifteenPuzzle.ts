// Pure game logic - no React, no UI, no input handling

export const BOARD_SIZE = 4;
export const TOTAL_TILES = BOARD_SIZE * BOARD_SIZE;

export type Board = number[];

export interface GameState {
  board: Board;
  moves: number;
  isWon: boolean;
}

export interface FifteenPuzzleConfig {
  boardSize: number;
}

export function createBoard(): Board {
  const tiles = Array.from({ length: TOTAL_TILES - 1 }, (_, i) => i + 1);
  let board: number[];
  do {
    board = [...tiles, 0].sort(() => Math.random() - 0.5);
  } while (!isSolvable(board));
  return board;
}

export function isSolvable(board: Board): boolean {
  let inversions = 0;
  const tiles = board.filter(v => v !== 0);
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  // For even-sized grids: solvable if (inversions + row of blank from bottom) is odd
  const blankIdx = board.indexOf(0);
  const rowFromTop = Math.floor(blankIdx / BOARD_SIZE);
  const rowFromBottom = BOARD_SIZE - 1 - rowFromTop;
  return (inversions + rowFromBottom) % 2 === 1;
}

export function isWon(board: Board): boolean {
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

export function createInitialState(): GameState {
  return {
    board: createBoard(),
    moves: 0,
    isWon: false,
  };
}

export function canMove(board: Board, idx: number): boolean {
  const blankIdx = board.indexOf(0);
  const r = Math.floor(idx / BOARD_SIZE);
  const c = idx % BOARD_SIZE;
  const blankR = Math.floor(blankIdx / BOARD_SIZE);
  const blankC = blankIdx % BOARD_SIZE;
  
  return (
    (Math.abs(r - blankR) === 1 && c === blankC) ||
    (Math.abs(c - blankC) === 1 && r === blankR)
  );
}

export function makeMove(board: Board, idx: number): Board {
  const blankIdx = board.indexOf(0);
  const newBoard = [...board];
  [newBoard[idx], newBoard[blankIdx]] = [newBoard[blankIdx], newBoard[idx]];
  return newBoard;
}
