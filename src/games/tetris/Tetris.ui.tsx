import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
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
  const [gameState, setGameState] = useState<TetrisState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('tetris'));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Game loop
  useEffect(() => {
    if (gameState.isRunning && !gameState.isGameOver && !gameState.isPaused) {
      const speed = Math.max(100, 1000 - (gameState.level - 1) * 100);
      intervalRef.current = setInterval(() => {
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
  }, [gameState.isRunning, gameState.isGameOver, gameState.isPaused, gameState.level]);

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
        case 'p':
        case 'P':
          handlePause(gameState, setGameState);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const handleReset = () => {
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

          {/* Pause overlay */}
          {gameState.isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-4">Paused</div>
                <button
                  onClick={() => handlePause(gameState, setGameState)}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg transition-colors"
                >
                  Resume
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls info */}
        <div className="text-sm text-gray-400 text-center">
          <div>← → : Move | ↑ : Rotate | ↓ : Soft Drop | Space : Hard Drop | P : Pause</div>
        </div>
      </div>
    </GameLayout>
  );
}
