// Input handling for Yahtzee - no React UI, just control logic

import {
  YahtzeeState,
  CategoryId,
  MAX_ROLLS,
  rollDice,
  toggleKeep,
  applyCategory,
} from './Yahtzee';

export function handleRoll(
  state: YahtzeeState,
  onStateChange: (newState: YahtzeeState) => void
): void {
  const next = rollDice(state);
  if (next !== state) onStateChange(next);
}

export function handleToggleKeep(
  state: YahtzeeState,
  index: number,
  onStateChange: (newState: YahtzeeState) => void,
  maxRolls: number = MAX_ROLLS
): void {
  const next = toggleKeep(state, index, maxRolls);
  if (next !== state) onStateChange(next);
}

export function handleScoreCategory(
  state: YahtzeeState,
  category: CategoryId,
  onStateChange: (newState: YahtzeeState) => void,
  maxRolls: number = MAX_ROLLS
): void {
  const next = applyCategory(state, category, maxRolls);
  if (next !== state) onStateChange(next);
}
