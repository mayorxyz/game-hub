import React, { useState, useEffect, useRef } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';
import GameLayout from '../../components/ui/GameLayout';
import VirtualDPad from '../../components/ui/controls/VirtualDPad';
import TouchControlContainer from '../../components/ui/controls/TouchControlContainer';

const GRID = 20;

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

  const handleDirectionPress = (direction: 'up' | 'down' | 'left' | 'right') => {
    const d = dirRef.current;
    if (direction === 'up' && d !== 'DOWN') setDir('UP');
    else if (direction === 'down' && d !== 'UP') setDir('DOWN');
    else if (direction === 'left' && d !== 'RIGHT') setDir('LEFT');
    else if (direction === 'right' && d !== 'LEFT') setDir('RIGHT');
  };

  return (
    <GameLayout title="Snake" score={score} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {!running && !gameOver && (
          <button onClick={reset} className="px-6 py-3 bg-blue-600 rounded-lg">Start</button>
        )}
        {gameOver && (
          <button onClick={reset} className="px-6 py-3 bg-blue-600 rounded-lg">Play Again</button>
        )}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 border border-gray-700 overflow-hidden">
            <div 
              className="grid h-full w-full"
              style={{ 
                gridTemplateColumns: `repeat(${GRID}, 1fr)`,
                gridTemplateRows: `repeat(${GRID}, 1fr)`
              }}
            >
              {Array.from({ length: GRID * GRID }).map((_, idx) => {
                const x = idx % GRID;
                const y = Math.floor(idx / GRID);
                const isSnake = snake.some(s => s.x === x && s.y === y);
                const isFood = food.x === x && food.y === y;
                return (
                  <div
                    key={idx}
                    className={`${isSnake ? 'bg-green-500' : isFood ? 'bg-red-500' : 'bg-gray-800'}`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Touch Controls */}
        <TouchControlContainer>
          <div className="flex justify-center">
            <VirtualDPad onDirectionPress={handleDirectionPress} />
          </div>
        </TouchControlContainer>
      </div>
    </GameLayout>
  );
}
