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
  { id: 'simon-says', name: 'Simon Says', path: '/games/simon-says', category: 'single', icon: '🎵', component: lazy(() => import('../games/simon-says/SimonSays')) },
  { id: 'reaction-timer', name: 'Reaction Timer', path: '/games/reaction-timer', category: 'single', icon: '⚡', component: lazy(() => import('../games/reaction-timer/ReactionTimer')) },
  { id: 'aim-trainer', name: 'Aim Trainer', path: '/games/aim-trainer', category: 'single', icon: '🎯', component: lazy(() => import('../games/aim-trainer/AimTrainer')) },
  { id: 'hangman', name: 'Hangman', path: '/games/hangman', category: 'single', icon: '💀', component: lazy(() => import('../games/hangman/Hangman')) },
  { id: 'wordle', name: 'Wordle', path: '/games/wordle', category: 'single', icon: '📝', component: lazy(() => import('../games/wordle/Wordle')) },
  { id: 'word-search', name: 'Word Search', path: '/games/word-search', category: 'single', icon: '🔍', component: lazy(() => import('../games/word-search/WordSearch')) },
  { id: 'typing-game', name: 'Typing Game', path: '/games/typing-game', category: 'single', icon: '⌨️', component: lazy(() => import('../games/typing-game/TypingGame')) },
  { id: 'idle-clicker', name: 'Idle Clicker', path: '/games/idle-clicker', category: 'single', icon: '💰', component: lazy(() => import('../games/idle-clicker/IdleClicker')) },
  { id: 'tic-tac-toe', name: 'Tic-Tac-Toe', path: '/games/tic-tac-toe', category: 'bot', icon: '❌', component: lazy(() => import('../games/tic-tac-toe/TicTacToe')) },
  { id: 'connect-four', name: 'Connect Four', path: '/games/connect-four', category: 'bot', icon: '🔴', component: lazy(() => import('../games/connect-four/ConnectFour')) },
  { id: 'rock-paper-scissors', name: 'Rock Paper Scissors', path: '/games/rock-paper-scissors', category: 'bot', icon: '✊', component: lazy(() => import('../games/rock-paper-scissors/RockPaperScissors')) },
  { id: 'reversi', name: 'Reversi', path: '/games/reversi', category: 'bot', icon: '⚫', component: lazy(() => import('../games/reversi/Reversi')) },
  { id: 'gomoku', name: 'Gomoku', path: '/games/gomoku', category: 'bot', icon: '⚪', component: lazy(() => import('../games/gomoku/Gomoku')) },
  { id: 'mancala', name: 'Mancala', path: '/games/mancala', category: 'bot', icon: '🫘', component: lazy(() => import('../games/mancala/Mancala')) },
  { id: 'checkers', name: 'Checkers', path: '/games/checkers', category: 'bot', icon: '🏁', component: lazy(() => import('../games/checkers/Checkers')) },
  { id: 'battleship', name: 'Battleship', path: '/games/battleship', category: 'bot', icon: '🚢', component: lazy(() => import('../games/battleship/Battleship')) },
  { id: 'pong', name: 'Pong', path: '/games/pong', category: 'bot', icon: '🏓', component: lazy(() => import('../games/pong/Pong')) },
  { id: 'blackjack', name: 'Blackjack', path: '/games/blackjack', category: 'house', icon: '🃏', component: lazy(() => import('../games/blackjack/Blackjack')) },
  { id: 'solitaire', name: 'Solitaire', path: '/games/solitaire', category: 'house', icon: '♠️', component: lazy(() => import('../games/solitaire/Solitaire')) },
];
