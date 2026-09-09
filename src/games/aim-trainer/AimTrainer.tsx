import React, { useState, useRef, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

const W = 400, H = 400;
const TIME_LIMIT = 30;

interface Target { x: number; y: number; r: number; id: number; }

export default function AimTrainer() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHS] = useState(getHighScore('aim-trainer'));
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [running, setRunning] = useState(false);
  const [misses, setMisses] = useState(0);
  const idRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const spawnRef = useRef<ReturnType<typeof setInterval>>();

  const spawnTarget = () => {
    const r = 15 + Math.random() * 20;
    setTargets(prev => [...prev, { x: r + Math.random() * (W - 2 * r), y: r + Math.random() * (H - 2 * r), r, id: idRef.current++ }]);
  };

  const start = () => {
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setRunning(true);
    setMisses(0);
    setTargets([]);
  };

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    spawnRef.current = setInterval(spawnTarget, 800);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(spawnRef.current);
    };
  }, [running]);

  useEffect(() => {
    if (!running && timeLeft === 0 && score > 0) {
      setHS(h => {
        const best = Math.max(h, score);
        setHighScore('aim-trainer', best);
        return best;
      });
    }
  }, [running, timeLeft, score]);

  const hitTarget = (id: number) => {
    if (!running) return;
    setTargets(prev => prev.filter(t => t.id !== id));
    setScore(s => s + 1);
  };

  const handleMiss = () => {
    if (running) setMisses(m => m + 1);
  };

  const accuracy = score + misses > 0 ? Math.round((score / (score + misses)) * 100) : 0;

  return (
    <GameLayout title="Aim Trainer" score={score} highScore={highScore} onReset={start}>
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-4 text-sm">
          <span className="text-gray-400">Time: <span className="text-white font-bold">{timeLeft}s</span></span>
          <span className="text-gray-400">Accuracy: <span className="text-white font-bold">{accuracy}%</span></span>
        </div>
        {!running && timeLeft === TIME_LIMIT && (
          <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg font-bold">Start</button>
        )}
        {timeLeft === 0 && <p className="text-amber-400 text-xl font-bold">Score: {score} | Accuracy: {accuracy}%</p>}
        <div
          className="relative bg-gray-800 rounded-xl border border-gray-700 cursor-crosshair overflow-hidden"
          style={{ width: W, height: H, maxWidth: '100%' }}
          onClick={handleMiss}
        >
          {targets.map(t => (
            <button
              key={t.id}
              onClick={(e) => { e.stopPropagation(); hitTarget(t.id); }}
              className="absolute rounded-full bg-gradient-to-br from-red-500 to-red-700 border-2 border-white hover:scale-110 transition-transform"
              style={{ left: t.x - t.r, top: t.y - t.r, width: t.r * 2, height: t.r * 2 }}
            />
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
