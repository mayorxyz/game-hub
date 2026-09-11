// Input handling for Gomoku - no React UI, just control logic

import { Board, BOARD_SIZE, Player, makeMove } from './Gomoku';

export function handleCellClick(
  board: Board,
  row: number,
  col: number,
  isPlayerTurn: boolean,
  isGameOver: boolean,
  onMove: (board: Board) => void
): void {
  if (isGameOver || !isPlayerTurn || board[row][col] !== 0) return;
  
  const newBoard = makeMove(board, row, col, 1);
  onMove(newBoard);
}
