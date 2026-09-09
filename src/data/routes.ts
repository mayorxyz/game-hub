import { lazy } from 'react';

export interface GameEntry {
  id: string;
  name: string;
  path: string;
  category: 'single' | 'bot' | 'house';
  icon: string;
  component: React.LazyExoticComponent<React.ComponentType>;
}

export const games: GameEntry[] = [
  { id: 'snake', name: 'Snake', path: '/games/snake', category: 'single', icon: '🐍', component: lazy(() => import('../games/snake/Snake')) },
  { id: '2048', name: '2048', path: '/games/2048', category: 'single', icon: '🔢', component: lazy(() => import('../games/game-2048/Game2048')) },
  { id: 'memory-match', name: 'Memory Match', path: '/games/memory-match', category: 'single', icon: '🃏', component: lazy(() => import('../games/memory-match/MemoryMatch')) },
  { id: 'minesweeper', name: 'Minesweeper', path: '/games/minesweeper', category: 'single', icon: '💣', component: lazy(() => import('../games/minesweeper/Minesweeper')) },
  { id: 'sudoku', name: 'Sudoku', path: '/games/sudoku', category: 'single', icon: '🧩', component: lazy(() => import('../games/sudoku/Sudoku')) },
  { id: 'lights-out', name: 'Lights Out', path: '/games/lights-out', category: 'single', icon: '💡', component: lazy(() => import('../games/lights-out/LightsOut')) },
  { id: 'fifteen-puzzle', name: '15 Puzzle', path: '/games/fifteen-puzzle', category: 'single', icon: '🧱', component: lazy(() => import('../games/fifteen-puzzle/FifteenPuzzle')) },
  { id: 'sokoban', name: 'Sokoban', path: '/games/sokoban', category: 'single', icon: '📦', component: lazy(() => import('../games/sokoban/Sokoban')) },
  { id: 'breakout', name: 'Breakout', path: '/games/breakout', category: 'single', icon: '🧱', component: lazy(() => import('../games/breakout/Breakout')) },
  { id: 'flappy-bird', name: 'Flappy Bird', path: '/games/flappy-bird', category: 'single', icon: '🐦', component: lazy(() => import('../games/flappy-bird/FlappyBird')) },
  { id: 'whack-a-mole', name: 'Whack-a-Mole', path: '/games/whack-a-mole', category: 'single', icon: '🔨', component: lazy(() => import('../games/whack-a-mole/WhackAMole')) },
];
