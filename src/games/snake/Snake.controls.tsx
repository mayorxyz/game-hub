import { useEffect } from 'react';
import { Direction, changeDirection } from './Snake';

// Keyboard controls hook
export function useKeyboardControls(
  onDirectionChange: (dir: Direction) => void,
  isEnabled: boolean
) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let newDir: Direction | null = null;
      
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          newDir = 'UP';
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newDir = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newDir = 'LEFT';
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newDir = 'RIGHT';
          break;
      }
      
      if (newDir) {
        e.preventDefault();
        onDirectionChange(newDir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onDirectionChange, isEnabled]);
}

// Touch controls handler
export function handleTouchDirection(
  currentDir: Direction,
  newDir: 'up' | 'down' | 'left' | 'right',
  onDirectionChange: (dir: Direction) => void
) {
  const directionMap = {
    up: 'UP' as Direction,
    down: 'DOWN' as Direction,
    left: 'LEFT' as Direction,
    right: 'RIGHT' as Direction,
  };
  
  const newDirection = directionMap[newDir];
  const validDirection = changeDirection(currentDir, newDirection);
  
  if (validDirection !== currentDir) {
    onDirectionChange(validDirection);
  }
}
