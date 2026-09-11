// Input handling - no React UI, just control logic

import { Board, Move, getAllMoves } from './Checkers';

export function handleCellClick(
  board: Board,
  r: number,
  c: number,
  isGameOver: boolean,
  isPlayerTurn: boolean,
  selected: [number, number] | null,
  onSelect: (pos: [number, number] | null) => void,
  onMove: (move: Move) => void
): void {
  if (isGameOver || !isPlayerTurn) return;

  if (selected) {
    const moves = getAllMoves(board, 1);
    const move = moves.find(
      m => m.from[0] === selected[0] && m.from[1] === selected[1] && m.to[0] === r && m.to[1] === c
    );
    if (move) {
      onMove(move);
      onSelect(null);
    } else {
      onSelect(null);
    }
  } else {
    if (board[r][c]?.player === 1) {
      onSelect([r, c]);
    }
  }
}
