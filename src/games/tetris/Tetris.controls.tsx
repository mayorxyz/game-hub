// Input handling for Tetris - no React UI, just control logic

import { TetrisState, movePiece, rotatePiece, isValidPosition, lockPiece } from './Tetris';
import { playSound } from '../../lib/sound';

export function handleMoveLeft(
  state: TetrisState,
  onStateChange: (newState: TetrisState) => void
): void {
  if (!state.currentPiece || state.isGameOver || state.isPaused) return;
  playSound('move');
  
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
  playSound('move');
  
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
  playSound('move');
  
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
  playSound('click');

  const rotatedPiece = rotatePiece(state.currentPiece);
  // Wall kicks: try in place, then nudge sideways / up before giving up.
  const kicks: [number, number][] = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [2, 0],
    [-2, 0],
    [0, -1],
  ];
  for (const [dx, dy] of kicks) {
    const candidate = movePiece(rotatedPiece, dx, dy);
    if (isValidPosition(state.board, candidate)) {
      onStateChange({ ...state, currentPiece: candidate });
      return;
    }
  }
}

export function handleHardDrop(
  state: TetrisState,
  onStateChange: (newState: TetrisState) => void
): void {
  if (!state.currentPiece || state.isGameOver || state.isPaused) return;
  playSound('success');
  


  
  let currentPiece = state.currentPiece;

  while (isValidPosition(state.board, movePiece(currentPiece, 0, 1))) {
    currentPiece = movePiece(currentPiece, 0, 1);

  }
  

  const dropped = { ...state, currentPiece };
  // Drop to the floor and lock immediately
  onStateChange(lockPiece(dropped));
}

export function handlePause(
  state: TetrisState,
  onStateChange: (newState: TetrisState) => void
): void {
  if (state.isGameOver) return;
  onStateChange({ ...state, isPaused: !state.isPaused });
}
