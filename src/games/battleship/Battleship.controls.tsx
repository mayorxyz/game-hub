// Input handling - no React UI, just control logic

export function handleAttackClick(
  isPlayerTurn: boolean,
  isGameOver: boolean,
  cellState: string,
  onAttack: (r: number, c: number) => void,
  r: number,
  c: number
): void {
  if (!isPlayerTurn || isGameOver || cellState !== 'empty') return;
  onAttack(r, c);
}
