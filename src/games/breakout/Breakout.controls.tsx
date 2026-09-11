import { useEffect, RefObject } from 'react';
import { CANVAS_WIDTH, PADDLE_WIDTH } from './Breakout';

export function useMouseControls(
  canvasRef: RefObject<HTMLCanvasElement>,
  paddleXRef: { current: number }
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const newX = (e.clientX - rect.left) * scaleX - PADDLE_WIDTH / 2;
      paddleXRef.current = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, newX));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [canvasRef, paddleXRef]);
}

export function useTouchControls(
  canvasRef: RefObject<HTMLCanvasElement>,
  paddleXRef: { current: number }
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const newX = (e.touches[0].clientX - rect.left) * scaleX - PADDLE_WIDTH / 2;
      paddleXRef.current = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, newX));
    };

    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => canvas.removeEventListener('touchmove', handleTouchMove);
  }, [canvasRef, paddleXRef]);
}
