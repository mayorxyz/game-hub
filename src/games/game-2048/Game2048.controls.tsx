import { useEffect, useRef } from 'react';
import { Board, move, addRandom, hasValidMoves } from './Game2048';

export function useKeyboardControls(
  onMove: (dir: 'left' | 'right' | 'up' | 'down') => void,
  isEnabled: boolean
) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let dir: 'left' | 'right' | 'up' | 'down' | null = null;
      if (e.key === 'ArrowLeft') dir = 'left';
      else if (e.key === 'ArrowRight') dir = 'right';
      else if (e.key === 'ArrowUp') dir = 'up';
      else if (e.key === 'ArrowDown') dir = 'down';
      
      if (dir) {
        e.preventDefault();
        onMove(dir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, isEnabled]);
}

export function useSwipeControls(
  onMove: (dir: 'left' | 'right' | 'up' | 'down') => void,
  isEnabled: boolean
) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !isEnabled) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    const threshold = 30;

    if (Math.max(absX, absY) < threshold) return;

    let dir: 'left' | 'right' | 'up' | 'down' | null = null;
    if (absX > absY) {
      dir = deltaX > 0 ? 'right' : 'left';
    } else {
      dir = deltaY > 0 ? 'down' : 'up';
    }

    if (dir) {
      onMove(dir);
    }
    touchStartRef.current = null;
  };

  return { handleTouchStart, handleTouchEnd };
}
