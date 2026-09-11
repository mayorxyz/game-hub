// Input handling for Sokoban - no React UI, just control logic

import { ParsedLevel, SokobanState, checkMove } from './Sokoban';

export function handleDirectionInput(
  state: SokobanState,
  parsed: ParsedLevel,
  direction: 'up' | 'down' | 'left' | 'right',
  onMove: (newState: SokobanState) => void
): void {
  if (state.isWon) return;

  let dr = 0;
  let dc = 0;
  if (direction === 'up') dr = -1;
  else if (direction === 'down') dr = 1;
  else if (direction === 'left') dc = -1;
  else if (direction === 'right') dc = 1;

  const { canMove, canPush, newBoxPos } = checkMove(parsed, state.player, dr, dc, state.boxes);

  if (!canMove) return;

  const [pr, pc] = state.player;
  const nr = pr + dr;
  const nc = pc + dc;

  const newBoxes = new Set(state.boxes);
  if (canPush && newBoxPos) {
    const k = `${nr},${nc}`;
    newBoxes.delete(k);
    newBoxes.add(newBoxPos);
  }

  const newState: SokobanState = {
    ...state,
    boxes: newBoxes,
    player: [nr, nc],
    moves: state.moves + 1,
    isWon: false, // Will be set by the game logic
  };

  onMove(newState);
}
