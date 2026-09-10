import React, { useState, useEffect, useRef } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';

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
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Whack-a-Mole</h1>
      <div className="mb-2 flex gap-6">
        <p>Score: {score} · Time: {time}s</p>
        <p>Best: {highScore}</p>
      </div>

      {notStarted && (
        <button onClick={start} className="px-6 py-3 bg-green-600 rounded-lg mb-4">
          Start
        </button>
      )}

      {gameEnded && (
        <div className="mb-4 text-center">
          <p className="text-amber-400 mb-2">Time's up! Score: {score}</p>
          <button onClick={start} className="px-6 py-3 bg-green-600 rounded-lg">
            Play Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {moles.map((up, i) => (
          <button
            key={i}
            onClick={() => whack(i)}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl transition-all ${
              up ? 'bg-amber-700 scale-110' : 'bg-gray-700'
            }`}
          >
            {up ? '🐹' : '🕳️'}
          </button>
        ))}
      </div>
    </div>
  );
}
