import React, { useState, useEffect, useRef } from 'react';
import { SnakeState, createInitialState, moveSnake, generateFood } from './Snake';
import { handleDirectionInput, handleStartGame, handleResetGame } from './Snake.controls';
import { getHighScore, setHighScore } from '../../lib/persistence';
 import { useGameResult } from '../../hooks/useGameResult';
import { usePause } from '../../lib/pause';
import { useSound } from '../../hooks/useSound';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';
import DifficultySelector from '../../components/ui/DifficultySelector';
import { Pause, Play } from 'lucide-react';

const FRUITS = ['🍎', '🍊', '🍒', '🍓', '🍇', '🍋', '🍑', '🍉'];
const BASE_GRID_SIZE = 20;
const BASE_SPEED = 150;

export default function SnakeUI() {
  const { difficulty, setDifficulty } = useDifficulty();
  const difficultySettings = getDifficultySettings(difficulty);
  
  const gridSize = applyDifficulty(BASE_GRID_SIZE, difficultySettings, 'size');
  const speed = Math.round(BASE_SPEED / difficultySettings.speedMultiplier);
  const scoreMultiplier = difficultySettings.scoreMultiplier;
  
  const [gameState, setGameState] = useState<SnakeState>(createInitialState(gridSize, scoreMultiplier));
  const [currentFruit, setCurrentFruit] = useState(FRUITS[0]);
  const [highScore, setHighScoreState] = useState(getHighScore('snake'));
   const { record } = useGameResult('snake');
  const { paused, toggle } = usePause();
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const play = useSound();
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [showCollisionFlash, setShowCollisionFlash] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Game loop
  useEffect(() => {
    if (gameState.isRunning && !gameState.isGameOver) {
      intervalRef.current = setInterval(() => {
          if (pausedRef.current) return;
        setGameState(prev => {
          const newState = moveSnake(prev, gridSize);
          
          // Check if food was eaten
          if (newState.score > prev.score) {
            const newFruit = FRUITS[Math.floor(Math.random() * FRUITS.length)];
            setCurrentFruit(newFruit);
          }
          
          // Check if game over
          if (newState.isGameOver && !prev.isGameOver) {
            setShowCollisionFlash(true);
            setTimeout(() => setShowCollisionFlash(false), 300);
            
            // Update high score
            if (newState.score > highScore) {
              setHighScore('snake', newState.score);
              setHighScoreState(newState.score);
              setIsNewHighScore(true);
            }
          }
          
          return newState;
        });
      }, speed);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState.isRunning, gameState.isGameOver, highScore, gridSize, speed]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameState.isRunning && !gameState.isGameOver) {
        handleStartGame(gameState, setGameState);
        return;
      }

      if (gameState.isGameOver) {
        if (e.key === ' ' || e.key === 'Enter') {
          handleReset();
        }
        return;
      }

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        toggle();
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleDirectionInput(gameState, 'UP', setGameState);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleDirectionInput(gameState, 'DOWN', setGameState);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleDirectionInput(gameState, 'LEFT', setGameState);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleDirectionInput(gameState, 'RIGHT', setGameState);
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

  const prevScoreRef = useRef(gameState.score);
  useEffect(() => {
    if (gameState.score > prevScoreRef.current) play('success');
    prevScoreRef.current = gameState.score;
  }, [gameState.score]);

  const handleReset = () => {
    handleResetGame(gridSize, scoreMultiplier, setGameState);
    setCurrentFruit(FRUITS[0]);
    setIsNewHighScore(false);
  };

  const handleStart = () => {
    handleStartGame(gameState, setGameState);
  };

  // Calculate head rotation based on direction
  const getHeadRotation = () => {
    switch (gameState.direction) {
      case 'UP':
        return 'rotate(-90deg)';
      case 'DOWN':
        return 'rotate(90deg)';
      case 'LEFT':
        return 'rotate(180deg)';
      case 'RIGHT':
        return 'rotate(0deg)';
    }
  };

  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    // Reset game when difficulty changes
    const newSettings = getDifficultySettings(newDifficulty);
    const newGridSize = applyDifficulty(BASE_GRID_SIZE, newSettings, 'size');
    const newScoreMultiplier = newSettings.scoreMultiplier;
    handleResetGame(newGridSize, newScoreMultiplier, setGameState);
    setCurrentFruit(FRUITS[0]);
    setIsNewHighScore(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Difficulty Selector */}
      <DifficultySelector 
        value={difficulty} 
        onChange={handleDifficultyChange}
        disabled={gameState.isRunning}
      />

      {/* Score Display */}
      <div className="flex items-center gap-8 text-xl font-bold">
        <div className="text-green-400">Score: {gameState.score}</div>
        <div className="text-yellow-400">Best: {highScore}</div>
        <button
          onClick={toggle}
          aria-label={paused ? 'Resume game' : 'Pause game'}
          aria-pressed={paused}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          title={paused ? 'Resume (P)' : 'Pause (P)'}
        >
          {paused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      </div>

      {/* Game Board */}
      <div 
        className={`relative bg-gray-900 border-4 border-gray-700 rounded-lg shadow-2xl ${
          showCollisionFlash ? 'animate-pulse bg-red-900' : ''
        }`}
        style={{ 
          width: '400px', 
          height: '400px',
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {/* Grid background */}
        {Array.from({ length: gridSize * gridSize }).map((_, i) => (
          <div 
            key={i} 
            className="border border-gray-800"
            style={{ gridColumn: (i % gridSize) + 1, gridRow: Math.floor(i / gridSize) + 1 }}
          />
        ))}

        {/* Snake body */}
        {gameState.snake.map((segment, index) => {
          const isHead = index === 0;
          return (
            <div
              key={index}
              className={`${isHead ? 'relative' : ''}`}
              style={{ 
                gridColumn: segment.x + 1, 
                gridRow: segment.y + 1,
                transition: 'all 0.1s ease-out',
              }}
            >
              {isHead ? (
                // Snake head with eyes
                <div 
                  className="w-full h-full bg-green-500 rounded-md relative"
                  style={{ transform: getHeadRotation() }}
                >
                  {/* Eyes */}
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
                  <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-white rounded-full" />
                  <div className="absolute top-1.5 right-1.5 w-0.5 h-0.5 bg-black rounded-full" />
                  <div className="absolute bottom-1.5 right-1.5 w-0.5 h-0.5 bg-black rounded-full" />
                </div>
              ) : (
                // Snake body segment
                <div className="w-full h-full bg-green-600 rounded-sm mx-0.5 my-0.5" />
              )}
            </div>
          );
        })}

        {/* Food */}
        <div
          className="flex items-center justify-center text-2xl animate-bounce"
          style={{ 
            gridColumn: gameState.food.x + 1, 
            gridRow: gameState.food.y + 1,
            animationDuration: '1s',
          }}
        >
          {currentFruit}
        </div>

        {/* Game States Overlay */}
        {!gameState.isRunning && !gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">Ready?</div>
              <div className="text-lg text-gray-300 mb-4">Press any arrow key to start</div>
              <button
                onClick={handleStart}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                Play
              </button>
            </div>
          </div>
        )}

        {gameState.isGameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">Game Over!</div>
              <div className="text-xl text-white mb-2">Score: {gameState.score}</div>
              {isNewHighScore && (
                <div className="text-lg text-yellow-400 mb-4 animate-pulse">
                  🏆 New High Score! 🏆
                </div>
              )}
              <button
                onClick={handleReset}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}

        {paused && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-gray-950/85 backdrop-blur-sm rounded-lg">
            <div className="text-3xl font-bold text-white">Paused</div>
            <button
              onClick={toggle}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-colors"
            >
              Resume
            </button>
            <p className="text-xs text-gray-400">Press P to resume</p>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="grid grid-cols-3 gap-2 w-48 md:hidden">
        <div />
        <button
          onClick={() => handleDirectionInput(gameState, 'UP', setGameState)}
          className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold"
        >
          ↑
        </button>
        <div />
        <button
          onClick={() => handleDirectionInput(gameState, 'LEFT', setGameState)}
          className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold"
        >
          ←
        </button>
        <button
          onClick={() => handleDirectionInput(gameState, 'DOWN', setGameState)}
          className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold"
        >
          ↓
        </button>
        <button
          onClick={() => handleDirectionInput(gameState, 'RIGHT', setGameState)}
          className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-bold"
        >
          →
        </button>
      </div>
    </div>
  );
}
