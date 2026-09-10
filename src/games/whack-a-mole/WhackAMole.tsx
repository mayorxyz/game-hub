import React, { useState, useEffect, useRef } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';
import GameLayout from '../../components/ui/GameLayout';

const G = 3;
const T = 30;

export default function WhackAMole() {
  const [moles, setMoles] = useState<boolean[]>(Array(G * G).fill(false));
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(T);
  const [running, setRunning] = useState(false);
  const [highScore, setHighScoreState] = useState(getHighScore('whack-a-mole'));
  const t = useRef<ReturnType<typeof setInterval>>();
  const m = useRef<ReturnType<typeof setInterval>>();

  const start = () => {
    setScore(0);
    setTime(T);
    setRunning(true);
    setMoles(Array(G * G).fill(false));
  };

  useEffect(() => {
    if (!running) return;
    t.current = setInterval(() => {
      setTime(prev => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    m.current = setInterval(() => {
      setMoles(() => {
        const newMoles = Array(G * G).fill(false);
        const n = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < n; i++) {
          newMoles[Math.floor(Math.random() * G * G)] = true;
        }
        return newMoles;
      });
    }, 800);
    return () => {
      clearInterval(t.current);
      clearInterval(m.current);
    };
  }, [running]);

  const whack = (i: number) => {
    if (!running || !moles[i]) return;
    setMoles(prev => {
      const next = [...prev];
      next[i] = false;
      return next;
    });
    setScore(s => s + 1);
  };

  const gameEnded = !running && time === 0;
  const notStarted = !running && time === T;

  // Update high score when game ends
  useEffect(() => {
    if (gameEnded && score > highScore) {
      setHighScore('whack-a-mole', score);
      setHighScoreState(score);
    }
  }, [gameEnded, score, highScore]);

  return (
    <GameLayout title="Whack-a-Mole" score={`${score} · Time: ${time}s`} highScore={highScore} onReset={start}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {notStarted && (
          <button onClick={start} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg">
            Start
          </button>
        )}

        {gameEnded && (
          <div className="text-center">
            <p className="text-amber-400 mb-2">Time's up! Score: {score}</p>
            <button onClick={start} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg">
              Play Again
            </button>
          </div>
        )}

        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid grid-cols-3 gap-3 p-4">
            {moles.map((up, i) => (
              <button
                key={i}
                onClick={() => whack(i)}
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
