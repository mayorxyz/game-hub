import { Board, toggle } from './LightsOut';

export function handleCellClick(
  board: Board,
  r: number,
  c: number,
  onToggle: (newBoard: Board) => void
) {
  const newBoard = toggle(board, r, c);
  onToggle(newBoard);
}
