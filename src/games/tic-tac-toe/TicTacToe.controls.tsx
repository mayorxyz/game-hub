// Input handling - no React UI, just control logic

import { Board } from './TicTacToe';

export function handleCellClick(
  board: Board,
  idx: number,
  isGameOver: boolean,
  isPlayerTurn: boolean,
  onMove: (idx: number) => void
): void {
  if (board[idx] || isGameOver || !isPlayerTurn) return;
  onMove(idx);
}
