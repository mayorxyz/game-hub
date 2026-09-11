// Input handling - no React UI, just control logic

export function handleWhack(
  moles: boolean[],
  idx: number,
  isRunning: boolean,
  onWhack: (idx: number) => void
): void {
  if (!isRunning || !moles[idx]) return;
  onWhack(idx);
}
