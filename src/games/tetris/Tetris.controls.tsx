// Input handling for Tetris - no React UI, just control logic

import { useRef, useCallback, useEffect } from 'react';
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

// ============================================================================
// Touch & Swipe Gesture Controls Hook
// ============================================================================

export function useTetrisTouchControls(
  state: TetrisState,
  onStateChange: (newState: TetrisState) => void
) {
  // Keep refs to latest state/props to avoid recreating callbacks mid-touch
  const stateRef = useRef(state);
  const onStateChangeRef = useRef(onStateChange);

  useEffect(() => {
    stateRef.current = state;
    onStateChangeRef.current = onStateChange;
  }, [state, onStateChange]);

  // Mutable touch tracking state (avoids re-renders during rapid touch events)
  const touchState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastMoveTime: 0,
    isTracking: false,
    longPressTimer: null as ReturnType<typeof setTimeout> | null,
    hasMoved: false,
  });

  // Configuration thresholds
  const MOVE_THRESHOLD = 20; // px to register as a swipe
  const TAP_THRESHOLD = 10; // px max movement to still be considered a tap
  const TAP_TIME_THRESHOLD = 200; // ms max duration for a tap
  const SWIPE_DEBOUNCE_MS = 120; // ms cadence for repeated horizontal/vertical moves
  const HARD_DROP_DISTANCE = 100; // px vertical drag to trigger hard drop
  const HARD_DROP_VELOCITY = 0.5; // px/ms velocity to trigger hard drop
  const LONG_PRESS_MS = 500; // ms to trigger pause via long-press

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.cancelable) e.preventDefault();

    const touch = e.touches[0];
    if (!touch) return;

    // Two-finger tap immediately triggers pause
    if (e.touches.length >= 2) {
      handlePause(stateRef.current, onStateChangeRef.current);
      return;
    }

    const current = touchState.current;
    current.startX = touch.clientX;
    current.startY = touch.clientY;
    current.startTime = Date.now();
    current.isTracking = true;
    current.hasMoved = false;
    current.lastMoveTime = current.startTime;

    // Set up long-press timer for pause
    current.longPressTimer = setTimeout(() => {
      if (current.isTracking && !current.hasMoved) {
        handlePause(stateRef.current, onStateChangeRef.current);
        current.isTracking = false; // Prevent further actions on touchend
      }
    }, LONG_PRESS_MS);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const current = touchState.current;
    if (!current.isTracking) return;
    
    if (e.cancelable) e.preventDefault();

    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = touch.clientX - current.startX;
    const deltaY = touch.clientY - current.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);
    const now = Date.now();

    // Check if movement exceeds the swipe threshold
    if (absDeltaX > MOVE_THRESHOLD || absDeltaY > MOVE_THRESHOLD) {
      current.hasMoved = true;
      
      // Cancel long-press since we've started swiping
      if (current.longPressTimer) {
        clearTimeout(current.longPressTimer);
        current.longPressTimer = null;
      }

      // Horizontal swipe (Left/Right)
      if (absDeltaX > absDeltaY) {
        if (now - current.lastMoveTime > SWIPE_DEBOUNCE_MS) {
          if (deltaX > 0) {
            handleMoveRight(stateRef.current, onStateChangeRef.current);
          } else {
            handleMoveLeft(stateRef.current, onStateChangeRef.current);
          }
          current.lastMoveTime = now;
          current.startX = touch.clientX; // Reset for continuous delta-based movement
        }
      } 
      // Vertical swipe (Down)
      else {
        if (deltaY > 0) {
          const velocity = deltaY / (now - current.startTime);
          
          // Fast or long swipe triggers hard drop
          if (deltaY > HARD_DROP_DISTANCE || velocity > HARD_DROP_VELOCITY) {
            handleHardDrop(stateRef.current, onStateChangeRef.current);
            current.isTracking = false; // Stop tracking after hard drop
          } 
          // Otherwise, standard soft drop with debounce
          else {
            if (now - current.lastMoveTime > SWIPE_DEBOUNCE_MS) {
              handleMoveDown(stateRef.current, onStateChangeRef.current);
              current.lastMoveTime = now;
              current.startY = touch.clientY; // Reset for continuous delta-based movement
            }
          }
        }
      }
    }
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    const current = touchState.current;
    
    if (current.longPressTimer) {
      clearTimeout(current.longPressTimer);
      current.longPressTimer = null;
    }

    if (!current.isTracking) {
      current.isTracking = false;
      return;
    }

    if (e.cancelable) e.preventDefault();

    const touch = e.changedTouches[0];
    if (!touch) return;

    const deltaX = Math.abs(touch.clientX - current.startX);
    const deltaY = Math.abs(touch.clientY - current.startY);
    const duration = Date.now() - current.startTime;

    // Tap detection: minimal movement and short duration
    if (
      !current.hasMoved &&
      deltaX < TAP_THRESHOLD &&
      deltaY < TAP_THRESHOLD &&
      duration < TAP_TIME_THRESHOLD
    ) {
      handleRotate(stateRef.current, onStateChangeRef.current);
    }

    current.isTracking = false;
  }, []);

  const onTouchCancel = useCallback(() => {
    const current = touchState.current;
    if (current.longPressTimer) {
      clearTimeout(current.longPressTimer);
      current.longPressTimer = null;
    }
    current.isTracking = false;
  }, []);

  return { onTouchStart, onTouchMove, onTouchEnd, onTouchCancel };
}