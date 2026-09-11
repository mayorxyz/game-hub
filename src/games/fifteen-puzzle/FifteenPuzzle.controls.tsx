// Input handling - no React UI, just control logic

import { Board, canMove } from './FifteenPuzzle';

export function handleTileClick(
  board: Board,
  idx: number,
  isWon: boolean,
  onMove: (idx: number) => void
): void {
  if (isWon) return;
  if (!canMove(board, idx)) return;
  onMove(idx);
}
