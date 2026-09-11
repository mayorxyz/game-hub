import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';
import GameLayout from '../../components/ui/GameLayout';
import {
  GameState,
  GRID_SIZE,
  GAME_DURATION,
  MOLE_SPAWN_INTERVAL,
  TIMER_INTERVAL,
  createInitialState,
  spawnMoles,
  whackMole,
  decrementTime,
} from './WhackAMole';
import { handleWhack } from './WhackAMole.controls';

export default function WhackAMole() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('whack-a-mole'));
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const moleRef = useRef<ReturnType<typeof setInterval>>();

  const start = useCallback(() => {
    setGameState({
      moles: Array(GRID_SIZE * GRID_SIZE).fill(false),
      score: 0,
      time: GAME_DURATION,
      isRunning: true,
      isGameOver: false,
    });
  }, []);

  // Timer and mole spawning
  useEffect(() => {
    if (!gameState.isRunning) return;

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        const { time, gameOver } = decrementTime(prev.time);
        return {
          ...prev,
          time,
          isRunning: !gameOver,
          isGameOver: gameOver,
        };
      });
    }, TIMER_INTERVAL);

    moleRef.current = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        moles: spawnMoles(),
      }));
    }, MOLE_SPAWN_INTERVAL);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(moleRef.current);
    };
  }, [gameState.isRunning]);

  // Update high score when game ends
  useEffect(() => {
    if (gameState.isGameOver && gameState.score > highScore) {
      setHighScore('whack-a-mole', gameState.score);
      setHighScoreState(gameState.score);
    }
  }, [gameState.isGameOver, gameState.score, highScore]);

  const onWhack = useCallback((idx: number) => {
    setGameState(prev => {
      const { moles, success } = whackMole(prev.moles, idx);
      return {
        ...prev,
        moles,
        score: success ? prev.score + 1 : prev.score,
      };
    });
  }, []);

  const onMoleClick = useCallback((idx: number) => {
    handleWhack(gameState.moles, idx, gameState.isRunning, onWhack);
  }, [gameState.moles, gameState.isRunning, onWhack]);

  const notStarted = !gameState.isRunning && !gameState.isGameOver && gameState.time === GAME_DURATION;

  return (
    <GameLayout
      title="Whack-a-Mole"
      score={`${gameState.score} · Time: ${gameState.time}s`}
      highScore={highScore}
      onReset={start}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {notStarted && (
          <button
            onClick={start}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg"
          >
            Start
          </button>
        )}

        {gameState.isGameOver && (
          <div className="text-center">
            <p className="text-amber-400 mb-2">Time's up! Score: {gameState.score}</p>
            <button
              onClick={start}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg"
            >
              Play Again
            </button>
          </div>
        )}

        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid grid-cols-3 gap-3 p-4">
            {gameState.moles.map((up, i) => (
              <button
                key={i}
                onClick={() => onMoleClick(i)}
                className={`aspect-square rounded-full flex items-center justify-center text-2xl sm:text-3xl transition-all touch-none ${
                  up ? 'bg-amber-700 scale-110' : 'bg-gray-700'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {up ? '🐹' : '🕳️'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
