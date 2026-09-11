import React, { useState, useEffect } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';
import GameLayout from '../../components/ui/GameLayout';

type B = (number | null)[][];

function valid(b: B, r: number, c: number, n: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (b[r][i] === n || b[i][c] === n) return false;
  }
  const br = Math.floor(r / 3) * 3, bc = Math.floor(c / 3) * 3;
  for (let i = br; i < br + 3; i++) for (let j = bc; j < bc + 3; j++) if (b[i][j] === n) return false;
  return true;
}

function solve(b: B): boolean {
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) if (b[r][c] === null) {
    for (let n = 1; n <= 9; n++) if (valid(b, r, c, n)) {
      b[r][c] = n;
      if (solve(b)) return true;
      b[r][c] = null;
    }
    return false;
  }
  return true;
}

function gen() {
  const b: B = Array.from({ length: 9 }, () => Array(9).fill(null));
  solve(b);
  const s = b.map(r => [...r]);
  const p = b.map(r => [...r]);
  for (let i = 0; i < 45; i++) {
    const r = Math.floor(Math.random() * 9), c = Math.floor(Math.random() * 9);
    if (p[r][c] !== null) p[r][c] = null;
  }
  return { puzzle: p, solution: s };
}

export default function Sudoku() {
  const [d] = useState(gen);
  const [b, setB] = useState<B>(() => d.puzzle.map(r => [...r]));
  const [sel, setSel] = useState<[number, number] | null>(null);
  const [won, setWon] = useState(false);
  const [err, setErr] = useState(0);
  const storedBest = getHighScore('sudoku');
  const [bestErr, setBestErr] = useState<number>(storedBest > 0 ? 10000 - storedBest : Infinity);

  const handleNum = (n: number) => {
    if (!sel || won) return;
    const [r, c] = sel;
    if (d.puzzle[r][c] !== null) return;
    const nb = b.map(row => [...row]);
    nb[r][c] = n === 0 ? null : n;
    setB(nb);
    if (n !== 0 && d.solution[r][c] !== n) setErr(e => e + 1);
    if (nb.every((row, ri) => row.every((v, ci) => v === d.solution[ri][ci]))) setWon(true);
  };

  const reset = () => {
    setB(d.puzzle.map(r => [...r]));
    setSel(null);
    setWon(false);
    setErr(0);
    setBestErr(storedBest > 0 ? 10000 - storedBest : Infinity);
  };

  useEffect(() => {
    if (won && err < bestErr) {
      setBestErr(err);
      setHighScore('sudoku', 10000 - err);
    }
  }, [won, err, bestErr]);

  return (
    <GameLayout title="Sudoku" score={`Errors: ${err}`} highScore={bestErr !== Infinity ? bestErr : undefined} onReset={reset}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {won && <p className="text-green-400">🎉 Solved!</p>}

        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid grid-cols-9 gap-0 border-2 border-gray-500 rounded overflow-hidden">
            {b.flat().map((v, i) => {
              const r = Math.floor(i / 9), c = i % 9;
              const orig = d.puzzle[r][c] !== null;
              const isSel = sel && sel[0] === r && sel[1] === c;
              const isErr = v !== null && !orig && d.solution[r][c] !== v;
              return (
                <button
                  key={i}
                  onClick={() => setSel([r, c])}
                  className={`flex items-center justify-center text-xs sm:text-sm font-bold border border-gray-700 min-h-[48px] min-w-[48px] ${
                    isSel ? 'bg-purple-700' : isErr ? 'bg-red-900/50' : orig ? 'bg-gray-800' : 'bg-gray-900 hover:bg-gray-800'
                  } ${c % 3 === 2 && c < 8 ? 'border-r-2 border-r-gray-500' : ''} ${r % 3 === 2 && r < 8 ? 'border-b-2 border-b-gray-500' : ''}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {v || ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Number Pad */}
        <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
            <button
              key={n}
              onClick={() => handleNum(n)}
              className="min-w-[48px] min-h-[48px] px-3 py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg font-bold text-sm sm:text-base"
              style={{ touchAction: 'manipulation' }}
            >
              {n || '⌫'}
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
