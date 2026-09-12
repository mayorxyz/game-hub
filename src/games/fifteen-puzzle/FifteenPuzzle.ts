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

export function createBoard(size: number = BOARD_SIZE): Board {
  const totalTiles = size * size;
  const tiles = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
  let board: number[];
  do {
    board = [...tiles, 0].sort(() => Math.random() - 0.5);
  } while (!isSolvable(board, size));
  return board;
}

export function isSolvable(board: Board, size: number = BOARD_SIZE): boolean {
  let inversions = 0;
  const tiles = board.filter(v => v !== 0);
  for (let i = 0; i < tiles.length; i++) {
    for (let j = i + 1; j < tiles.length; j++) {
      if (tiles[i] > tiles[j]) inversions++;
    }
  }
  // For even-sized grids: solvable if (inversions + row of blank from bottom) is odd
  const blankIdx = board.indexOf(0);
  const rowFromTop = Math.floor(blankIdx / size);
  const rowFromBottom = size - 1 - rowFromTop;
  return (inversions + rowFromBottom) % 2 === 1;
}

export function isWon(board: Board): boolean {
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

export function createInitialState(size: number = BOARD_SIZE): GameState {
  return {
    board: createBoard(size),
    moves: 0,
    isWon: false,
  };
}

export function canMove(board: Board, idx: number, size: number = BOARD_SIZE): boolean {
  const blankIdx = board.indexOf(0);
  const r = Math.floor(idx / size);
  const c = idx % size;
  const blankR = Math.floor(blankIdx / size);
  const blankC = blankIdx % size;
  
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
