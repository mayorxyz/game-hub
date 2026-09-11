import { useEffect } from 'react';

export function useKeyboardControls(
  onJump: () => void,
  isEnabled: boolean
) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        onJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onJump, isEnabled]);
}

export function useTouchControls(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  onJump: () => void
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      onJump();
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      onJump();
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchstart', handleTouchStart);
    };
  }, [canvasRef, onJump]);
}
