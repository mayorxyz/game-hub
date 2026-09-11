// Input handling for Reversi - no React UI, just control logic

import { Board, getFlips, getValidMoves } from './Reversi';

export function handleCellClick(
  board: Board,
  r: number,
  c: number,
  isPlayerTurn: boolean,
  isGameOver: boolean,
  onMove: (r: number, c: number) => void
): void {
  if (isGameOver || !isPlayerTurn) return;
  
  const flips = getFlips(board, r, c, 1);
  if (flips.length === 0) return;
  
  onMove(r, c);
}
