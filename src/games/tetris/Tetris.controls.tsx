// Input handling for Tetris - no React UI, just control logic

import { TetrisState, movePiece, rotatePiece, isValidPosition } from './Tetris';

export function handleMoveLeft(
  state: TetrisState,
  onStateChange: (newState: TetrisState) => void
): void {
  if (!state.currentPiece || state.isGameOver || state.isPaused) return;
  
  const movedPiece = movePiece(state.currentPiece, -1, 0);
  if (isValidPosition(state.board, movedPiece)) {
    onStateChange({ ...state, currentPiece: movedPiece });
  }
}

export function handleMoveRight(
  state: TetrisState,
  onStateChange: (newState: TetrisState) => void
): void {
  if (!state.currentPiece || state.isGameOver || state.isPaused) return;
  
  const movedPiece = movePiece(state.currentPiece, 1, 0);
  if (isValidPosition(state.board, movedPiece)) {
    onStateChange({ ...state, currentPiece: movedPiece });
  }
}

export function handleMoveDown(
  state: TetrisState,
  onStateChange: (newState: TetrisState) => void
): void {
  if (!state.currentPiece || state.isGameOver || state.isPaused) return;
  
  const movedPiece = movePiece(state.currentPiece, 0, 1);
  if (isValidPosition(state.board, movedPiece)) {
    onStateChange({ ...state, currentPiece: movedPiece });
  }
}

export function handleRotate(
  state: TetrisState,
  onStateChange: (newState: TetrisState) => void
): void {
  if (!state.currentPiece || state.isGameOver || state.isPaused) return;
  
  const rotatedPiece = rotatePiece(state.currentPiece);
  if (isValidPosition(state.board, rotatedPiece)) {
    onStateChange({ ...state, currentPiece: rotatedPiece });
  }
}

export function handleHardDrop(
  state: TetrisState,
  onStateChange: (newState: TetrisState) => void
): void {
  if (!state.currentPiece || state.isGameOver || state.isPaused) return;
  
  let dropDistance = 0;
  let currentPiece = state.currentPiece;
  
  while (isValidPosition(state.board, movePiece(currentPiece, 0, 1))) {
    currentPiece = movePiece(currentPiece, 0, 1);
    dropDistance++;
  }
  
  // Apply drop and lock piece
  const newState = { ...state, currentPiece };
  // We need to import lockPiece but to avoid circular dependency, we'll handle it in the UI
  onStateChange(newState);
}

export function handlePause(
  state: TetrisState,
  onStateChange: (newState: TetrisState) => void
): void {
  if (state.isGameOver) return;
  onStateChange({ ...state, isPaused: !state.isPaused });
}
