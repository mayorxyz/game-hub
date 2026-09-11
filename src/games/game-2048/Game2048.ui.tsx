import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  Board,
  GameState,
  createInitialState,
  move,
  addRandom,
  hasValidMoves,
} from './Game2048';
import { useKeyboardControls, useSwipeControls } from './Game2048.controls';

export default function Game2048() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('2048'));

  // Handle move
  const handleMove = useCallback((dir: 'left' | 'right' | 'up' | 'down') => {
    if (gameState.isGameOver) return;
    
    setGameState(prev => {
      const { board: newBoard, score: points, moved } = move(prev.board, dir);
      if (!moved) return prev;
      
      const boardWithNew = addRandom(newBoard);
      const newScore = prev.score + points;
      const isGameOver = !hasValidMoves(boardWithNew);
      
      return {
        board: boardWithNew,
        score: newScore,
        isGameOver,
      };
    });
  }, [gameState.isGameOver]);

  // Keyboard controls
  useKeyboardControls(handleMove, !gameState.isGameOver);

  // Swipe controls
  const { handleTouchStart, handleTouchEnd } = useSwipeControls(handleMove, !gameState.isGameOver);

  // Update high score when game ends
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0) {
      const currentHigh = getHighScore('2048');
      if (gameState.score > currentHigh) {
        setHighScore('2048', gameState.score);
        setHighScoreState(gameState.score);
      }
    }
  }, [gameState.isGameOver, gameState.score]);

  const reset = useCallback(() => {
    setGameState(createInitialState());
    setHighScoreState(getHighScore('2048'));
  }, []);

  return (
    <GameLayout
      title="2048"
      score={gameState.score}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.isGameOver && <p className="text-red-400 text-xl font-bold">Game Over!</p>}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div
            className="absolute inset-0 bg-gray-800 p-2 sm:p-4 rounded-lg grid grid-cols-4 gap-1 sm:gap-2 touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y' }}
          >
            {gameState.board.flat().map((v, i) => (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded text-base sm:text-xl md:text-2xl font-bold transition-all ${
                  v ? 'bg-blue-600' : 'bg-gray-700'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {v || ''}
              </div>
            ))}
          </div>
        </div>
        
        <p className="text-gray-500 text-xs">Swipe or use arrow keys</p>
      </div>
    </GameLayout>
  );
}
