import { useEffect, RefObject } from 'react';
import { CANVAS_HEIGHT, PADDLE_HEIGHT } from './Pong';

export function useMouseControls(
  canvasRef: RefObject<HTMLCanvasElement>,
  paddleYRef: { current: number }
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleY = CANVAS_HEIGHT / rect.height;
      const newY = (e.clientY - rect.top) * scaleY - PADDLE_HEIGHT / 2;
      paddleYRef.current = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    return () => canvas.removeEventListener('mousemove', handleMouseMove);
  }, [canvasRef, paddleYRef]);
}

export function useTouchControls(
  canvasRef: RefObject<HTMLCanvasElement>,
  paddleYRef: { current: number }
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleY = CANVAS_HEIGHT / rect.height;
      const newY = (e.touches[0].clientY - rect.top) * scaleY - PADDLE_HEIGHT / 2;
      paddleYRef.current = Math.max(0, Math.min(CANVAS_HEIGHT - PADDLE_HEIGHT, newY));
    };

    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => canvas.removeEventListener('touchmove', handleTouchMove);
  }, [canvasRef, paddleYRef]);
}
