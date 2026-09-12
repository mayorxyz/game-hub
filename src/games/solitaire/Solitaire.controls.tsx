// Input handling for Solitaire - no React UI, just control logic

import { SolitaireState, drawCard, placeOnFoundation, placeOnTableau, selectWaste } from './Solitaire';

export function handleDrawCard(state: SolitaireState, onStateChange: (newState: SolitaireState) => void, drawCount: number = 1): void {
  const newState = drawCard(state, drawCount);
  onStateChange(newState);
}

export function handleFoundationClick(
  state: SolitaireState,
  foundationIdx: number,
  onStateChange: (newState: SolitaireState) => void
): void {
  const newState = placeOnFoundation(state, foundationIdx);
  onStateChange(newState);
}

export function handleTableauClick(
  state: SolitaireState,
  tableauIdx: number,
  onStateChange: (newState: SolitaireState) => void
): void {
  const newState = placeOnTableau(state, tableauIdx);
  onStateChange(newState);
}

export function handleWasteClick(
  state: SolitaireState,
  onStateChange: (newState: SolitaireState) => void
): void {
  const newState = selectWaste(state);
  onStateChange(newState);
}
