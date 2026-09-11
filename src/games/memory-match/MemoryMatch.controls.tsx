import { Card } from './MemoryMatch';

export function handleCardClick(
  cards: Card[],
  selected: number[],
  idx: number,
  onFlip: (idx: number) => void,
  onSelect: (selected: number[]) => void
) {
  // Can't select if already 2 cards selected, card is flipped, or card is matched
  if (selected.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
  
  onFlip(idx);
  onSelect([...selected, idx]);
}
