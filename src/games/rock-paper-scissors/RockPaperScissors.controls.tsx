// Input handling - no React UI, just control logic

import { Choice } from './RockPaperScissors';

export function handleChoiceSelect(
  choice: Choice,
  onPlay: (choice: Choice) => void
): void {
  onPlay(choice);
}
