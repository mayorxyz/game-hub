// Input handling - no React UI, just control logic

import { Board } from './ConnectFour';

export function handleColumnClick(
  board: Board,
  col: number,
  isGameOver: boolean,
  isPlayerTurn: boolean,
  onDrop: (col: number) => void
): void {
  if (isGameOver || !isPlayerTurn || board[0][col] !== 0) return;
  onDrop(col);
}
