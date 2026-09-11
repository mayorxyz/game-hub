// Input handling for Typing Game - no React UI, just control logic

import { TypingGameState, updateInput } from './TypingGame';

export function handleInputChange(
  state: TypingGameState,
  input: string,
  onStateChange: (newState: TypingGameState) => void
): void {
  const newState = updateInput(state, input);
  onStateChange(newState);
}
