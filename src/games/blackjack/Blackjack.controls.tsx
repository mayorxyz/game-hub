// Input handling - no React UI, just control logic

export function handleDeal(
  chips: number,
  bet: number,
  onDeal: () => void
): void {
  if (chips < bet) return;
  onDeal();
}

export function handleBetChange(
  currentBet: number,
  chips: number,
  minBet: number,
  maxBet: number,
  direction: 'increase' | 'decrease',
  onBetChange: (newBet: number) => void
): void {
  const newBet = direction === 'increase'
    ? Math.min(maxBet, currentBet + 5)
    : Math.max(minBet, currentBet - 5);
  onBetChange(newBet);
}
