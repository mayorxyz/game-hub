import React, { useState, useEffect } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';

const SIZE = 4;

type Board = number[][];

function createBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function addRandom(board: Board): Board {
  const empty: [number, number][] = [];
  board.forEach((row, r) => row.forEach((v, c) => v === 0 && empty.push([r, c])));
  if (empty.length === 0) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const nb = board.map(row => [...row]);
  nb[r][c] = Math.random() < 0.9 ? 2 : 4;
  return nb;
}

function slide(row: number[]): { row: number[]; score: number } {
  let score = 0;
  const filtered = row.filter(v => v !== 0);
  const merged: number[] = [];
  for (let i = 0; i < filtered.length; i++) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      merged.push(filtered[i] * 2);
      score += filtered[i] * 2;
      i++;
    } else {
      merged.push(filtered[i]);
    }
  }
  while (merged.length < SIZE) merged.push(0);
  return { row: merged, score };
}

function move(board: Board, dir: 'left' | 'right' | 'up' | 'down'): { board: Board; score: number; moved: boolean } {
  let total = 0;
  let moved = false;
  const nb = board.map(r => [...r]);

  if (dir === 'left') {
    for (let i = 0; i < SIZE; i++) {
      const { row, score } = slide(nb[i]);
      if (nb[i].some((v, j) => v !== row[j])) moved = true;
      nb[i] = row;
      total += score;
    }
  } else if (dir === 'right') {
    for (let i = 0; i < SIZE; i++) {
      const { row, score } = slide([...nb[i]].reverse());
      const reversed = row.reverse();
      if (nb[i].some((v, j) => v !== reversed[j])) moved = true;
      nb[i] = reversed;
      total += score;
    }
  } else if (dir === 'up') {
    for (let c = 0; c < SIZE; c++) {
      const col = nb.map(r => r[c]);
      const { row, score } = slide(col);
      if (col.some((v, j) => v !== row[j])) moved = true;
      row.forEach((v, r) => { nb[r][c] = v; });
      total += score;
    }
  } else {
    for (let c = 0; c < SIZE; c++) {
      const col = nb.map(r => r[c]).reverse();
      const { row, score } = slide(col);
      const reversed = row.reverse();
      const orig = nb.map(r => r[c]);
      if (orig.some((v, j) => v !== reversed[j])) moved = true;
      reversed.forEach((v, r) => { nb[r][c] = v; });
      total += score;
    }
  }

  return { board: nb, score: total, moved };
}

function hasValidMoves(board: Board): boolean {
  // Check for empty cells
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 0) return true;
    }
  }
  // Check for possible merges
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const val = board[r][c];
      if (r < SIZE - 1 && board[r + 1][c] === val) return true;
      if (c < SIZE - 1 && board[r][c + 1] === val) return true;
    }
  }
  return false;
}

export default function Game2048() {
  const [board, setBoard] = useState<Board>(() => addRandom(addRandom(createBoard())));
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScoreState] = useState(getHighScore('2048'));

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      let dir: 'left' | 'right' | 'up' | 'down' | null = null;
      if (e.key === 'ArrowLeft') dir = 'left';
      else if (e.key === 'ArrowRight') dir = 'right';
      else if (e.key === 'ArrowUp') dir = 'up';
      else if (e.key === 'ArrowDown') dir = 'down';
      
      if (dir) {
        e.preventDefault();
        setBoard(prev => {
          const { board: nb, score: pts, moved } = move(prev, dir!);
          if (!moved) return prev;
          const withNew = addRandom(nb);
          setScore(s => s + pts);
          // Check for game over
          if (!hasValidMoves(withNew)) {
            setGameOver(true);
            // Update high score
            setScore(currentScore => {
              const currentHigh = getHighScore('2048');
              if (currentScore > currentHigh) {
                setHighScore('2048', currentScore);
                setHighScoreState(currentScore);
              }
              return currentScore;
            });
          }
          return withNew;
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameOver]);

  const reset = () => {
    setBoard(addRandom(addRandom(createBoard())));
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">2048</h1>
      <div className="mb-4 flex gap-6">
        <p>Score: {score}</p>
        <p>Best: {highScore}</p>
      </div>
      {gameOver && <p className="text-red-400 text-xl font-bold mb-4">Game Over!</p>}
      <button onClick={reset} className="px-6 py-3 bg-blue-600 rounded-lg mb-4">Reset</button>
      <div className="bg-gray-800 p-4 rounded-lg grid grid-cols-4 gap-2">
        {board.flat().map((v, i) => (
          <div key={i} className={`w-16 h-16 flex items-center justify-center rounded text-2xl font-bold ${v ? 'bg-blue-600' : 'bg-gray-700'}`}>
            {v || ''}
          </div>
        ))}
      </div>
    </div>
  );
}
