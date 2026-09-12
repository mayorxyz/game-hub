// Pure game logic for Sudoku - no React, no UI, no input handling
import { mulberry32 } from '../../lib/random';

export type Board = (number | null)[][];

export interface SudokuState {
  puzzle: Board;
  solution: Board;
  currentBoard: Board;
  selectedCell: [number, number] | null;
  errors: number;
  isWon: boolean;
}

export function createEmptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null));
}

export function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
  }
  
  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (board[i][j] === num) return false;
    }
  }
  
  return true;
}

export function solveSudoku(board: Board): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === null) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, row, col, num)) {
            board[row][col] = num;
            if (solveSudoku(board)) return true;
            board[row][col] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export const BASE_REMOVED_CELLS = 45;

export function generatePuzzle(seed?: number, removedCells: number = BASE_REMOVED_CELLS): { puzzle: Board; solution: Board } {
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;
  const board = createEmptyBoard();
  if (seed !== undefined) {
    const firstRow = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let i = firstRow.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [firstRow[i], firstRow[j]] = [firstRow[j], firstRow[i]];
    }
    board[0] = firstRow;
  }
  solveSudoku(board);

  const solution = board.map(row => [...row]);
  const puzzle = board.map(row => [...row]);

  // Remove cells to create the puzzle (more removals = fewer givens = harder)
  for (let i = 0; i < removedCells; i++) {
    const row = Math.floor(rng() * 9);
    const col = Math.floor(rng() * 9);
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
    }
  }

  return { puzzle, solution };
}

export function createInitialState(seed?: number, removedCells: number = BASE_REMOVED_CELLS): SudokuState {
  const { puzzle, solution } = generatePuzzle(seed, removedCells);
  return {
    puzzle,
    solution,
    currentBoard: puzzle.map(row => [...row]),
    selectedCell: null,
    errors: 0,
    isWon: false,
  };
}

export function selectCell(state: SudokuState, row: number, col: number): SudokuState {
  return {
    ...state,
    selectedCell: [row, col],
  };
}

export function inputNumber(state: SudokuState, num: number): SudokuState {
  if (!state.selectedCell || state.isWon) return state;
  
  const [row, col] = state.selectedCell;
  if (state.puzzle[row][col] !== null) return state;
  
  const newBoard = state.currentBoard.map(row => [...row]);
  newBoard[row][col] = num === 0 ? null : num;
  
  let newErrors = state.errors;
  if (num !== 0 && state.solution[row][col] !== num) {
    newErrors++;
  }
  
  const isWon = newBoard.every((row, ri) => 
    row.every((val, ci) => val === state.solution[ri][ci])
  );
  
  return {
    ...state,
    currentBoard: newBoard,
    errors: newErrors,
    isWon,
  };
}

export function resetGame(seed?: number, removedCells: number = BASE_REMOVED_CELLS): SudokuState {
  return createInitialState(seed, removedCells);
}

export function isCellOriginal(state: SudokuState, row: number, col: number): boolean {
  return state.puzzle[row][col] !== null;
}

export function isCellError(state: SudokuState, row: number, col: number): boolean {
  const val = state.currentBoard[row][col];
  return val !== null && !isCellOriginal(state, row, col) && state.solution[row][col] !== val;
}
