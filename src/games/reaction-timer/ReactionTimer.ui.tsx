import React, { useState, useRef, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  Phase,
  ReactionTimerState,
  createInitialState,
  getDelay,
  isNewBest,
} from './ReactionTimer';
import { handleClick } from './ReactionTimer.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings } from '../../lib/difficulty';
import { useSound } from '../../hooks/useSound';

export default function ReactionTimer() {
  const { difficulty } = useDifficulty();
  // Harder settings shorten the wait before the screen turns green.
  const timeMultiplier = getDifficultySettings(difficulty).timeMultiplier;
  const play = useSound();

  const [gameState, setGameState] = useState<ReactionTimerState>(
    createInitialState(getHighScore('reaction-timer') || Infinity)
  );
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onStart = () => {
    setGameState(prev => ({ ...prev, phase: 'ready' }));
    const delay = getDelay(timeMultiplier);
    timerRef.current = setTimeout(() => {
      play('tick');
      setGameState(prev => ({
        ...prev,
        phase: 'go',
        startTime: Date.now(),
      }));
    }, delay);
  };

  const onTooEarly = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    play('gameover');
    setGameState(prev => ({ ...prev, phase: 'too-early' }));
  };

  const onResult = (reactionTime: number) => {
    play('success');
    setGameState(prev => {
      const newBest = isNewBest(reactionTime, prev.bestTime) ? reactionTime : prev.bestTime;
      if (isNewBest(reactionTime, prev.bestTime)) {
        setHighScore('reaction-timer', reactionTime);
      }
      return {
        ...prev,
        phase: 'result',
        reactionTime,
        bestTime: newBest,
      };
    });
  };

  const onClick = () => {
    handleClick(gameState.phase, gameState.startTime, onStart, onTooEarly, onResult);
  };

  const bgColors: Record<Phase, string> = {
    waiting: 'from-gray-700 to-gray-800',
    ready: 'from-red-700 to-red-900',
    go: 'from-green-500 to-green-700',
    result: 'from-blue-700 to-blue-900',
    'too-early': 'from-orange-700 to-orange-900',
  };

  const messages: Record<Phase, string> = {
    waiting: 'Click to Start',
    ready: 'Wait for green...',
    go: 'CLICK NOW!',
    result: `${gameState.reactionTime}ms — Click to try again`,
    'too-early': 'Too early! Click to retry',
  };

  return (
    <GameLayout
      title="Reaction Timer"
      showDifficulty
      score={gameState.phase === 'result' ? `${gameState.reactionTime}ms` : undefined}
      highScore={gameState.bestTime === Infinity ? undefined : `${gameState.bestTime}ms`}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        <button
          onClick={onClick}
          className={`w-full max-w-[min(90vw,600px)] h-[min(60vh,400px)] rounded-2xl bg-gradient-to-br ${bgColors[gameState.phase]} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold transition-all duration-200 active:scale-95 touch-none`}
          style={{ touchAction: 'manipulation' }}
        >
          {messages[gameState.phase]}
        </button>
      </div>
    </GameLayout>
  );
}
