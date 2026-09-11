// Input handling for Idle Clicker - no React UI, just control logic

import { IdleClickerState, click, buyUpgrade } from './IdleClicker';

export function handleClick(
  state: IdleClickerState,
  onClick: (newState: IdleClickerState) => void
): void {
  const newState = click(state);
  onClick(newState);
}

export function handleBuyUpgrade(
  state: IdleClickerState,
  idx: number,
  onBuy: (newState: IdleClickerState) => void
): void {
  if (state.coins < state.upgrades[idx].cost) return;
  const newState = buyUpgrade(state, idx);
  onBuy(newState);
}
