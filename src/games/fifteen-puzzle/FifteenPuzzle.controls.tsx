// Input handling - no React UI, just control logic

import { Board, canMove, BOARD_SIZE } from './FifteenPuzzle';

export function handleTileClick(
  board: Board,
  idx: number,
  isWon: boolean,
  onMove: (idx: number) => void,
  size: number = BOARD_SIZE
): void {
  if (isWon) return;
  if (!canMove(board, idx, size)) return;
  onMove(idx);
}
