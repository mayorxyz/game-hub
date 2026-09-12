import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { usePause } from '../../lib/pause';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings } from '../../lib/difficulty';
import {
  TetrisState,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  createInitialState,
  tick,
  movePiece,
  isValidPosition,
  lockPiece,
} from './Tetris';
import {
  handleMoveLeft,
  handleMoveRight,
  handleMoveDown,
  handleRotate,
  handleHardDrop,
  handlePause,
} from './Tetris.controls';

const CELL_SIZE = 28;

export default function Tetris() {
  const [gameState, setGameState] = useState<TetrisState>(() => loadSavedState<TetrisState>('tetris', d => d as TetrisState) ?? createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('tetris'));
  const { record } = useGameResult('tetris');
  const { paused, toggle } = usePause();
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  useGameStatePersistence("tetris", gameState, s => s, s => !s.isGameOver);
  const { difficulty } = useDifficulty();
  const difficultySettings = getDifficultySettings(difficulty);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Game loop
  useEffect(() => {
    if (gameState.isRunning && !gameState.isGameOver && !gameState.isPaused) {
      const speed = Math.max(60, Math.round((1000 - (gameState.level - 1) * 100) / difficultySettings.speedMultiplier));
      intervalRef.current = setInterval(() => {
          if (pausedRef.current) return;
        setGameState(prev => tick(prev));
      }, speed);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState.isRunning, gameState.isGameOver, gameState.isPaused, gameState.level, difficultySettings.speedMultiplier]);

  // Update high score
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > highScore) {
      setHighScore('tetris', gameState.score);
      setHighScoreState(gameState.score);
    }
  }, [gameState.isGameOver, gameState.score, highScore]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
      }
      if (gameState.isGameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          handleReset();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleMoveLeft(gameState, setGameState);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleMoveRight(gameState, setGameState);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleMoveDown(gameState, setGameState);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleRotate(gameState, setGameState);
          break;
        case ' ':
          handleHardDrop(gameState, setGameState);
          break;

      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  useEffect(() => {
    if (gameState.isGameOver) {
      record({ won: false, score: gameState.score });
    }
  }, [gameState.isGameOver]);

  const handleReset = () => {
    clearSavedState('tetris');
    setGameState(createInitialState());
  };

  const handleStart = () => {
    setGameState(prev => ({ ...prev, isRunning: true }));
  };

  // Render board with current piece
  const renderBoard = () => {
    const cells = [];
    
    // Render locked pieces
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        const cell = gameState.board[y][x];
        cells.push(
          <div
            key={`board-${y}-${x}`}
            className={`border border-gray-800 ${cell ? getPieceColor(cell) : 'bg-gray-900'}`}
            style={{
              gridColumn: x + 1,
              gridRow: y + 1,
            }}
          />
        );
      }
    }

    // Render current piece
    if (gameState.currentPiece && !gameState.isGameOver) {
      for (let y = 0; y < gameState.currentPiece.shape.length; y++) {
        for (let x = 0; x < gameState.currentPiece.shape[y].length; x++) {
          if (gameState.currentPiece.shape[y][x]) {
            const boardX = gameState.currentPiece.position.x + x;
            const boardY = gameState.currentPiece.position.y + y;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              cells.push(
                <div
                  key={`piece-${y}-${x}`}
                  className={`border border-gray-700 ${getPieceColor(gameState.currentPiece.type)}`}
                  style={{
                    gridColumn: boardX + 1,
                    gridRow: boardY + 1,
                  }}
                />
              );
            }
          }
        }
      }
    }

    return cells;
  };

  const getPieceColor = (type: string) => {
    const colors: Record<string, string> = {
      I: 'bg-cyan-500',
      O: 'bg-yellow-500',
      T: 'bg-purple-500',
      S: 'bg-green-500',
      Z: 'bg-red-500',
      J: 'bg-blue-500',
      L: 'bg-orange-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  return (
    <GameLayout
      title="Tetris"
      pauseOnSpace={false}
      showDifficulty
      score={gameState.score}
      highScore={highScore}
      onReset={handleReset}
    >
      <div className="flex flex-col items-center gap-4 p-4">
        {/* Game stats */}
        <div className="flex gap-8 text-lg font-bold">
          <div className="text-cyan-400">Score: {gameState.score}</div>
          <div className="text-yellow-400">Level: {gameState.level}</div>
          <div className="text-green-400">Lines: {gameState.lines}</div>
        </div>

        {/* Game board */}
        <div
          className="relative bg-gray-900 border-4 border-gray-700 rounded-lg"
          style={{
            width: BOARD_WIDTH * CELL_SIZE,
            height: BOARD_HEIGHT * CELL_SIZE,
            display: 'grid',
            gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${BOARD_HEIGHT}, ${CELL_SIZE}px)`,
          }}
        >
          {renderBoard()}

          {/* Game over overlay */}
          {gameState.isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">Game Over!</div>
                <div className="text-xl text-gray-300 mb-4">Score: {gameState.score}</div>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {/* Start overlay */}
          {!gameState.isRunning && !gameState.isGameOver && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-4">Tetris</div>
                <button
                  onClick={handleStart}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors"
                >
                  Start Game
                </button>
              </div>
            </div>
          )}


        </div>

        {/* Touch controls (mobile) */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-sm">
          <button onClick={() => handleMoveLeft(gameState, setGameState)} aria-label="Move left" className="px-4 h-12 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg text-white text-xl">←</button>
          <button onClick={() => handleRotate(gameState, setGameState)} aria-label="Rotate" className="px-4 h-12 bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-500 rounded-lg text-white">Rotate</button>
          <button onClick={() => handleMoveRight(gameState, setGameState)} aria-label="Move right" className="px-4 h-12 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg text-white text-xl">→</button>
          <button onClick={() => handleMoveDown(gameState, setGameState)} aria-label="Soft drop" className="px-4 h-12 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg text-white text-xl">↓</button>
          <button onClick={() => handleHardDrop(gameState, setGameState)} aria-label="Hard drop" className="px-4 h-12 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg text-white">Drop</button>
          <button onClick={toggle} aria-label="Pause" className="px-4 h-12 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg text-white">Pause</button>
        </div>
        {/* Controls info */}
        <div className="text-sm text-gray-400 text-center">
          <div>← → : Move | ↑ : Rotate | ↓ : Soft Drop | Space : Hard Drop | P : Pause</div>
        </div>
      </div>
    </GameLayout>
  );
}
