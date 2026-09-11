// Input handling for Reaction Timer - no React UI, just control logic

import { Phase, getDelay, calculateReactionTime, isTooEarly, isReadyToStart } from './ReactionTimer';

export function handleClick(
  phase: Phase,
  startTime: number,
  onStart: () => void,
  onTooEarly: () => void,
  onResult: (reactionTime: number) => void
): void {
  if (isReadyToStart(phase)) {
    onStart();
  } else if (isTooEarly(phase)) {
    onTooEarly();
  } else if (phase === 'go') {
    const reactionTime = calculateReactionTime(startTime);
    onResult(reactionTime);
  }
}
