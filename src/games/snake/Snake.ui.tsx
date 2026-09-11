import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import VirtualDPad from '../../components/ui/controls/VirtualDPad';
import TouchControlContainer from '../../components/ui/controls/TouchControlContainer';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { getDifficultySettings, applyDifficulty, Difficulty } from '../../lib/difficulty';
import {
  GameState,
  SnakeConfig,
  createInitialState,
  updateGameState,
  generateFood,
} from './Snake';
import { useKeyboardControls, handleTouchDirection } from './Snake.controls';

// Base configuration (before difficulty adjustment)
const BASE_GRID_SIZE = 20;
const BASE_SPEED = 150; // milliseconds

export default function SnakeGame() {
  // Difficulty state (could be lifted to global settings later)
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const difficultySettings = getDifficultySettings(difficulty);
  
  // Apply difficulty to base config
  const config: SnakeConfig = {
    gridSize: applyDifficulty(BASE_GRID_SIZE, difficultySettings, 'size'),
    speed: applyDifficulty(BASE_SPEED, difficultySettings, 'speed'),
  };

  // Game state
  const [gameState, setGameState] = useState<GameState>(() => createInitialState(config.gridSize));
  const [highScore, setHighScoreState] = useState(getHighScore('snake'));
  
  // Ref for direction to avoid stale closures in interval
  const directionRef = useRef(gameState.direction);
  directionRef.current = gameState.direction;

  // Keyboard controls
  useKeyboardControls(
    useCallback((newDir) => {
      setGameState(prev => ({ ...prev, direction: newDir }));
    }, []),
    gameState.isRunning && !gameState.isGameOver
  );

  // Game loop
  useEffect(() => {
    if (!gameState.isRunning || gameState.isGameOver) return;

    const interval = setInterval(() => {
      setGameState(prev => updateGameState(prev, config));
    }, config.speed);

    return () => clearInterval(interval);
  }, [gameState.isRunning, gameState.isGameOver, config.speed]);

  // High score update
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > 0) {
      const currentHigh = getHighScore('snake');
      if (gameState.score > currentHigh) {
        setHighScore('snake', gameState.score);
        setHighScoreState(gameState.score);
      }
    }
  }, [gameState.isGameOver, gameState.score]);

  // Game controls
  const startGame = () => {
    setGameState(prev => ({ ...prev, isRunning: true }));
  };

  const resetGame = () => {
    setGameState(createInitialState(config.gridSize));
  };

  const handleTouchDirectionPress = (dir: 'up' | 'down' | 'left' | 'right') => {
    handleTouchDirection(gameState.direction, dir, (newDir) => {
      setGameState(prev => ({ ...prev, direction: newDir }));
    });
  };

  return (
    <GameLayout 
      title="Snake" 
      score={gameState.score} 
      highScore={highScore} 
      onReset={resetGame}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {/* Difficulty selector */}
        <div className="flex gap-2">
          {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => {
                setDifficulty(diff);
                resetGame();
              }}
              className={`px-4 py-2 rounded-lg ${
                difficulty === diff
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>

        {/* Start/Play Again button */}
        {!gameState.isRunning && !gameState.isGameOver && (
          <button 
            onClick={startGame}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg"
          >
            Start
          </button>
        )}
        {gameState.isGameOver && (
          <button 
            onClick={resetGame}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg"
          >
            Play Again
          </button>
        )}
        
        {/* Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 border border-gray-700 overflow-hidden">
            <div 
              className="grid h-full w-full"
              style={{ 
                gridTemplateColumns: `repeat(${config.gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${config.gridSize}, 1fr)`
              }}
            >
              {Array.from({ length: config.gridSize * config.gridSize }).map((_, idx) => {
                const x = idx % config.gridSize;
                const y = Math.floor(idx / config.gridSize);
                const isSnake = gameState.snake.some(s => s.x === x && s.y === y);
                const isFood = gameState.food.x === x && gameState.food.y === y;
                return (
                  <div
                    key={idx}
                    className={`${
                      isSnake ? 'bg-green-500' : isFood ? 'bg-red-500' : 'bg-gray-800'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Touch Controls */}
        <TouchControlContainer>
          <div className="flex justify-center">
            <VirtualDPad onDirectionPress={handleTouchDirectionPress} />
          </div>
        </TouchControlContainer>
      </div>
    </GameLayout>
  );
}
