// Pure game logic for Sudoku - no React, no UI, no input handling

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

export function generatePuzzle(): { puzzle: Board; solution: Board } {
  const board = createEmptyBoard();
  solveSudoku(board);
  
  const solution = board.map(row => [...row]);
  const puzzle = board.map(row => [...row]);
  
  // Remove 45 cells to create the puzzle
  for (let i = 0; i < 45; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== null) {
      puzzle[row][col] = null;
    }
  }
  
  return { puzzle, solution };
}

export function createInitialState(): SudokuState {
  const { puzzle, solution } = generatePuzzle();
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

export function resetGame(): SudokuState {
  return createInitialState();
}

export function isCellOriginal(state: SudokuState, row: number, col: number): boolean {
  return state.puzzle[row][col] !== null;
}

export function isCellError(state: SudokuState, row: number, col: number): boolean {
  const val = state.currentBoard[row][col];
  return val !== null && !isCellOriginal(state, row, col) && state.solution[row][col] !== val;
}
