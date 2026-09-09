import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

const COLORS = ['red', 'blue', 'green', 'yellow'];
const COLOR_STYLES: Record<string, string> = {
  red: 'bg-red-800',
  blue: 'bg-blue-800',
  green: 'bg-green-800',
  yellow: 'bg-yellow-800',
};
const ACTIVE_STYLES: Record<string, string> = {
  red: 'bg-red-400 shadow-lg shadow-red-400/50',
  blue: 'bg-blue-400 shadow-lg shadow-blue-400/50',
  green: 'bg-green-400 shadow-lg shadow-green-400/50',
  yellow: 'bg-yellow-400 shadow-lg shadow-yellow-400/50',
};

export default function SimonSays() {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerIdx, setPlayerIdx] = useState(0);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [isShowing, setIsShowing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHS] = useState(getHighScore('simon-says'));
  const [started, setStarted] = useState(false);

  const showSequence = (seq: string[]) => {
    setIsShowing(true);
    seq.forEach((color, i) => {
      setTimeout(() => setActiveColor(color), i * 600);
      setTimeout(() => setActiveColor(null), i * 600 + 400);
    });
    setTimeout(() => { setIsShowing(false); setPlayerIdx(0); }, seq.length * 600);
  };

  const start = () => {
    const first = [COLORS[Math.floor(Math.random() * 4)]];
    setSequence(first);
    setScore(0);
    setGameOver(false);
    setStarted(true);
    showSequence(first);
  };

  const handlePress = (color: string) => {
    if (isShowing || gameOver || !started) return;
    setActiveColor(color);
    setTimeout(() => setActiveColor(null), 200);

    if (color === sequence[playerIdx]) {
      if (playerIdx === sequence.length - 1) {
        const newScore = score + 1;
        setScore(newScore);
        setHS(h => { const best = Math.max(h, newScore); setHighScore('simon-says', best); return best; });
        const next = [...sequence, COLORS[Math.floor(Math.random() * 4)]];
        setSequence(next);
        setTimeout(() => showSequence(next), 800);
      } else {
        setPlayerIdx(p => p + 1);
      }
    } else {
      setGameOver(true);
    }
  };

  return (
    <GameLayout title="Simon Says" score={score} highScore={highScore} onReset={start}>
      <div className="flex flex-col items-center gap-4">
        {gameOver && <p className="text-red-400 text-xl font-bold">Wrong! Score: {score}</p>}
        {!started && <button onClick={start} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg font-bold">Start</button>}
        <div className="grid grid-cols-2 gap-3 w-56 h-56 sm:w-64 sm:h-64">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => handlePress(color)}
              disabled={isShowing}
              className={`rounded-2xl transition-all duration-150 ${
                activeColor === color ? ACTIVE_STYLES[color] : COLOR_STYLES[color]
              } ${isShowing ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
            />
          ))}
        </div>
        <p className="text-gray-500 text-xs">{isShowing ? 'Watch...' : started && !gameOver ? 'Your turn!' : ''}</p>
      </div>
    </GameLayout>
  );
}
