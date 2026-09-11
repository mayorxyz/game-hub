// Input handling for Sudoku - no React UI, just control logic

import { SudokuState, selectCell, inputNumber } from './Sudoku';

export function handleCellClick(
  state: SudokuState,
  row: number,
  col: number,
  onStateChange: (newState: SudokuState) => void
): void {
  const newState = selectCell(state, row, col);
  onStateChange(newState);
}

export function handleNumberInput(
  state: SudokuState,
  num: number,
  onStateChange: (newState: SudokuState) => void
): void {
  const newState = inputNumber(state, num);
  onStateChange(newState);
}
