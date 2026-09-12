// Input handling for Dots and Boxes - no React UI, just control logic

import { 
  DotsAndBoxesState, 
  placeHorizontalLine, 
  placeVerticalLine,
  GRID_SIZE 
} from './DotsAndBoxes';

export function handleHorizontalLineClick(
  state: DotsAndBoxesState,
  row: number,
  col: number,
  onStateChange: (newState: DotsAndBoxesState) => void
): void {
  if (state.isGameOver) return;
  if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE - 1) return;
  
  const newState = placeHorizontalLine(state, row, col);
  if (newState !== state) {
    onStateChange(newState);
  }
}

export function handleVerticalLineClick(
  state: DotsAndBoxesState,
  row: number,
  col: number,
  onStateChange: (newState: DotsAndBoxesState) => void
): void {
  if (state.isGameOver) return;
  if (row < 0 || row >= GRID_SIZE - 1 || col < 0 || col >= GRID_SIZE) return;
  
  const newState = placeVerticalLine(state, row, col);
  if (newState !== state) {
    onStateChange(newState);
  }
}
