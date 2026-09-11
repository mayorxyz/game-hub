// Input handling for Minesweeper - no React UI, just control logic

import { Board, revealCell, toggleFlag } from './Minesweeper';

export function handleCellClick(
  board: Board,
  r: number,
  c: number,
  flagMode: boolean,
  onReveal: (board: Board, isOver: boolean, isWon: boolean) => void,
  onFlag: (board: Board) => void
): void {
  if (flagMode) {
    const newBoard = toggleFlag(board, r, c);
    onFlag(newBoard);
  } else {
    const { board: newBoard, isOver, isWon } = revealCell(board, r, c);
    onReveal(newBoard, isOver, isWon);
  }
}

export function handleContextMenu(
  board: Board,
  r: number,
  c: number,
  onFlag: (board: Board) => void
): void {
  const newBoard = toggleFlag(board, r, c);
  onFlag(newBoard);
}
