// Input handling - no React UI, just control logic

export function handleColorPress(
  isShowing: boolean,
  isGameOver: boolean,
  isStarted: boolean,
  onActivate: (color: string) => void,
  color: string
): void {
  if (isShowing || isGameOver || !isStarted) return;
  onActivate(color);
}
