import React, { useState, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

type Phase = 'waiting' | 'ready' | 'go' | 'result' | 'too-early';

export default function ReactionTimer() {
  const [phase, setPhase] = useState<Phase>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTime, setReactionTime] = useState(0);
  const [best, setBest] = useState(getHighScore('reaction-timer') || Infinity);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const start = () => {
    setPhase('ready');
    const delay = 1500 + Math.random() * 3000;
    timerRef.current = setTimeout(() => {
      setPhase('go');
      setStartTime(Date.now());
    }, delay);
  };

  const handleClick = () => {
    if (phase === 'waiting' || phase === 'result' || phase === 'too-early') {
      start();
    } else if (phase === 'ready') {
      clearTimeout(timerRef.current);
      setPhase('too-early');
    } else if (phase === 'go') {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setPhase('result');
      if (time < best) {
        setBest(time);
        setHighScore('reaction-timer', 10000 - time);
      }
    }
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
    result: `${reactionTime}ms — Click to try again`,
    'too-early': 'Too early! Click to retry',
  };

  return (
    <GameLayout title="Reaction Timer" score={phase === 'result' ? `${reactionTime}ms` : undefined} highScore={best === Infinity ? undefined : `${best}ms`}>
      <div className="flex flex-col items-center gap-4">
        <button
          onClick={handleClick}
          className={`w-full max-w-md h-64 sm:h-80 rounded-2xl bg-gradient-to-br ${bgColors[phase]} flex items-center justify-center text-white text-2xl sm:text-3xl font-bold transition-all duration-200 active:scale-95`}
        >
          {messages[phase]}
        </button>
      </div>
    </GameLayout>
  );
}
