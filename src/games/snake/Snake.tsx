import React, { useState, useEffect, useRef } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';

const GRID = 20;
const CELL = 20;

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Pos = { x: number; y: number };

function generateFood(snake: Pos[]): Pos {
  let pos: Pos;
  do {
    pos = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function Snake() {
  const [snake, setSnake] = useState<Pos[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Pos>({ x: 5, y: 5 });
  const [dir, setDir] = useState<Dir>('RIGHT');
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScoreState] = useState(getHighScore('snake'));
  const dirRef = useRef(dir);
  dirRef.current = dir;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const d = dirRef.current;
      if ((e.key === 'ArrowUp' || e.key === 'w') && d !== 'DOWN') setDir('UP');
      else if ((e.key === 'ArrowDown' || e.key === 's') && d !== 'UP') setDir('DOWN');
      else if ((e.key === 'ArrowLeft' || e.key === 'a') && d !== 'RIGHT') setDir('LEFT');
      else if ((e.key === 'ArrowRight' || e.key === 'd') && d !== 'LEFT') setDir('RIGHT');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (!running || gameOver) return;
    const interval = setInterval(() => {
      setSnake(prev => {
        const head = { ...prev[0] };
        const d = dirRef.current;
        if (d === 'UP') head.y--;
        else if (d === 'DOWN') head.y++;
        else if (d === 'LEFT') head.x--;
        else head.x++;

        if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID || prev.some(s => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          setRunning(false);
          return prev;
        }

        const newSnake = [head, ...prev];
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [running, gameOver, food]);

  // Update high score when game ends
  useEffect(() => {
    if (gameOver && score > 0) {
      const currentHigh = getHighScore('snake');
      if (score > currentHigh) {
        setHighScore('snake', score);
        setHighScoreState(score);
      }
    }
  }, [gameOver, score]);

  const reset = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 5, y: 5 });
    setDir('RIGHT');
    setScore(0);
    setGameOver(false);
    setRunning(true);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Snake</h1>
      <div className="mb-4 flex gap-6">
        <p>Score: {score}</p>
        <p>Best: {highScore}</p>
      </div>
      {!running && !gameOver && <button onClick={reset} className="px-6 py-3 bg-blue-600 rounded-lg mb-4">Start</button>}
      {gameOver && <button onClick={reset} className="px-6 py-3 bg-blue-600 rounded-lg mb-4">Play Again</button>}
      <div className="border border-gray-700">
        {Array.from({ length: GRID }).map((_, y) => (
          <div key={y} className="flex">
            {Array.from({ length: GRID }).map((_, x) => {
              const isSnake = snake.some(s => s.x === x && s.y === y);
              const isFood = food.x === x && food.y === y;
              return (
                <div
                  key={x}
                  className={`w-5 h-5 ${isSnake ? 'bg-green-500' : isFood ? 'bg-red-500' : 'bg-gray-800'}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
