// Input handling for Word Search - no React UI, just control logic

import { WordSearchState, findWord } from './WordSearch';

export function handleWordClick(
  state: WordSearchState,
  word: string,
  onStateChange: (newState: WordSearchState) => void
): void {
  const newState = findWord(state, word);
  onStateChange(newState);
}
