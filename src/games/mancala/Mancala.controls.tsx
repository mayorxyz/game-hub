// Input handling for Mancala - no React UI, just control logic

import { MancalaState, sow, isGameOver } from './Mancala';

export function handlePitClick(
  state: MancalaState,
  pit: number,
  isPlayerTurn: boolean,
  isGameOver: boolean,
  onMove: (newState: MancalaState, extraTurn: boolean) => void
): void {
  if (isGameOver || !isPlayerTurn) return;
  if (pit < 0 || pit > 5 || state.pits[pit] === 0) return;

  const { state: newState, extraTurn } = sow(state, pit);
  onMove(newState, extraTurn);
}
