// Input handling - no React UI, just control logic

export function handleTargetClick(
  isRunning: boolean,
  onHit: (id: number) => void,
  id: number
): void {
  if (!isRunning) return;
  onHit(id);
}

export function handleMissClick(
  isRunning: boolean,
  onMiss: () => void
): void {
  if (isRunning) {
    onMiss();
  }
}
