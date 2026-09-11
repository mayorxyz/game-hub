import React, { useState, useRef, useEffect, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  Target,
  GameState,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  TIME_LIMIT,
  SPAWN_INTERVAL,
  createInitialState,
  spawnTarget,
  hitTarget,
  calculateAccuracy,
  decrementTime,
} from './AimTrainer';
import { handleTargetClick, handleMissClick } from './AimTrainer.controls';

export default function AimTrainer() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('aim-trainer'));
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const spawnRef = useRef<ReturnType<typeof setInterval>>();

  const spawnTargetCallback = useCallback(() => {
    const newTarget = spawnTarget(idRef.current++);
    setGameState(prev => ({
      ...prev,
      targets: [...prev.targets, newTarget],
    }));
  }, []);

  const start = useCallback(() => {
    setGameState({
      targets: [],
      score: 0,
      timeLeft: TIME_LIMIT,
      isRunning: true,
      misses: 0,
    });
  }, []);

  // Timer and spawn logic
  useEffect(() => {
    if (!gameState.isRunning) return;

    timerRef.current = setInterval(() => {
      setGameState(prev => {
        const { timeLeft, gameOver } = decrementTime(prev.timeLeft);
        return {
          ...prev,
          timeLeft,
          isRunning: !gameOver,
        };
      });
    }, 1000);

    spawnRef.current = setInterval(spawnTargetCallback, SPAWN_INTERVAL);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(spawnRef.current);
    };
  }, [gameState.isRunning, spawnTargetCallback]);

  // Update high score when game ends
  useEffect(() => {
    if (!gameState.isRunning && gameState.timeLeft === 0 && gameState.score > 0) {
      setHighScoreState(prev => {
        const best = Math.max(prev, gameState.score);
        setHighScore('aim-trainer', best);
        return best;
      });
    }
  }, [gameState.isRunning, gameState.timeLeft, gameState.score]);

  const onHitTarget = useCallback((id: number) => {
    setGameState(prev => ({
      ...prev,
      targets: hitTarget(prev.targets, id),
      score: prev.score + 1,
    }));
  }, []);

  const onTargetClick = useCallback((id: number) => {
    handleTargetClick(gameState.isRunning, onHitTarget, id);
  }, [gameState.isRunning, onHitTarget]);

  const onMiss = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      misses: prev.misses + 1,
    }));
  }, []);

  const onMissClick = useCallback(() => {
    handleMissClick(gameState.isRunning, onMiss);
  }, [gameState.isRunning, onMiss]);

  const accuracy = calculateAccuracy(gameState.score, gameState.misses);
  const notStarted = !gameState.isRunning && gameState.timeLeft === TIME_LIMIT;
  const gameEnded = gameState.timeLeft === 0;

  return (
    <GameLayout
      title="Aim Trainer"
      score={gameState.score}
      highScore={highScore}
      onReset={start}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4 text-sm">
          <span className="text-gray-400">Time: <span className="text-white font-bold">{gameState.timeLeft}s</span></span>
          <span className="text-gray-400">Accuracy: <span className="text-white font-bold">{accuracy}%</span></span>
        </div>

        {notStarted && (
          <button
            onClick={start}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg font-bold"
          >
            Start
          </button>
        )}

        {gameEnded && (
          <p className="text-amber-400 text-xl font-bold">
            Score: {gameState.score} | Accuracy: {accuracy}%
          </p>
        )}

        {/* Responsive Game Area */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div
            className="absolute inset-0 bg-gray-800 rounded-xl border border-gray-700 cursor-crosshair overflow-hidden touch-none"
            onClick={onMissClick}
            style={{ touchAction: 'none' }}
          >
            {gameState.targets.map(t => (
              <button
                key={t.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onTargetClick(t.id);
                }}
                className="absolute rounded-full bg-gradient-to-br from-red-500 to-red-700 border-2 border-white hover:scale-110 transition-transform"
                style={{
                  left: `${(t.x - t.r) / CANVAS_WIDTH * 100}%`,
                  top: `${(t.y - t.r) / CANVAS_HEIGHT * 100}%`,
                  width: `${(t.r * 2) / CANVAS_WIDTH * 100}%`,
                  height: `${(t.r * 2) / CANVAS_HEIGHT * 100}%`,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
