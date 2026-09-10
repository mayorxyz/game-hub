import React, { useState, useEffect, useRef } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';
import GameLayout from '../../components/ui/GameLayout';

const R = 9, C = 9, M = 10;
type Cell = { mine: boolean; revealed: boolean; flagged: boolean; count: number };

function create() {
  const b: Cell[][] = Array.from({ length: R }, () => Array.from({ length: C }, () => ({ mine: false, revealed: false, flagged: false, count: 0 })));
  let p = 0;
  while (p < M) {
    const r = Math.floor(Math.random() * R), c = Math.floor(Math.random() * C);
    if (!b[r][c].mine) { b[r][c].mine = true; p++; }
  }
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    if (b[r][c].mine) continue;
    let n = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr < R && nc >= 0 && nc < C && b[nr][nc].mine) n++;
    }
    b[r][c].count = n;
  }
  return b;
}

function flood(b: Cell[][], r: number, c: number) {
  const nb = b.map(row => row.map(cell => ({ ...cell })));
  const s: [number, number][] = [[r, c]];
  while (s.length) {
    const [cr, cc] = s.pop()!;
    if (cr < 0 || cr >= R || cc < 0 || cc >= C || nb[cr][cc].revealed || nb[cr][cc].flagged) continue;
    nb[cr][cc].revealed = true;
    if (nb[cr][cc].count === 0 && !nb[cr][cc].mine)
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if (dr || dc) s.push([cr + dr, cc + dc]);
  }
  return nb;
}

export default function Minesweeper() {
  const [board, setBoard] = useState(create);
  const [over, setOver] = useState(false);
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);
  const [bestTime, setBestTime] = useState(getHighScore('minesweeper'));
  const [flagMode, setFlagMode] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (running && !over && !won) {
      timerRef.current = setInterval(() => setTime(t => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [running, over, won]);

  useEffect(() => {
    if (won && time > 0) {
      const currentBest = getHighScore('minesweeper');
      if (currentBest === 0 || time < currentBest) {
        setHighScore('minesweeper', time);
        setBestTime(time);
      }
    }
  }, [won, time]);

  const reveal = (r: number, c: number) => {
    if (over || won || board[r][c].flagged || board[r][c].revealed) return;
    if (!running) setRunning(true);
    if (board[r][c].mine) {
      setBoard(prev => prev.map(row => row.map(cell => ({ ...cell, revealed: cell.mine ? true : cell.revealed }))));
      setOver(true);
      return;
    }
    const nb = flood(board, r, c);
    setBoard(nb);
    if (nb.flat().filter(c => !c.revealed && !c.mine).length === 0) setWon(true);
  };

  const flag = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (over || won || board[r][c].revealed) return;
    setBoard(prev => prev.map((row, ri) => row.map((cell, ci) => ri === r && ci === c ? { ...cell, flagged: !cell.flagged } : cell)));
  };

  const handleCellClick = (r: number, c: number) => {
    if (flagMode) {
      setBoard(prev => prev.map((row, ri) => row.map((cell, ci) =>
        ri === r && ci === c && !cell.revealed ? { ...cell, flagged: !cell.flagged } : cell
      )));
    } else {
      reveal(r, c);
    }
  };

  const reset = () => {
    setBoard(create());
    setOver(false);
    setWon(false);
    setTime(0);
    setRunning(false);
    setBestTime(getHighScore('minesweeper'));
  };

  const nc = ['', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-amber-400', 'text-cyan-400', 'text-pink-400', 'text-gray-400'];

  return (
    <GameLayout title="Minesweeper" score={`Time: ${time}s`} highScore={bestTime > 0 ? `${bestTime}s` : undefined} onReset={reset}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {over && <p className="text-red-400">💥 Boom!</p>}
        {won && <p className="text-green-400">🏆 Cleared!</p>}

        {/* Flag Mode Toggle */}
        <button
          onClick={() => setFlagMode(!flagMode)}
          className={`px-4 py-2 rounded-lg transition-all ${flagMode ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          {flagMode ? '🚩 Flag Mode ON' : '🚩 Flag Mode OFF'}
        </button>

        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div
            className="absolute inset-0 grid gap-[1px] bg-gray-700 p-1 rounded overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${C}, 1fr)`, gridTemplateRows: `repeat(${R}, 1fr)` }}
          >
            {board.flat().map((cell, i) => {
              const r = Math.floor(i / C), c = i % C;
              return (
                <button
                  key={i}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={e => flag(e, r, c)}
                  className={`flex items-center justify-center text-xs sm:text-sm font-bold rounded-sm min-h-[48px] min-w-[48px] ${
                    cell.revealed
                      ? (cell.mine ? 'bg-red-600' : 'bg-gray-800')
                      : 'bg-gray-600 hover:bg-gray-500 active:bg-gray-500'
                  } ${cell.count > 0 && cell.revealed ? nc[cell.count] : ''}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {cell.revealed ? (cell.mine ? '💣' : cell.count || '') : cell.flagged ? '🚩' : ''}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-gray-500 text-xs">Tap to reveal • Toggle flag mode to mark mines</p>
      </div>
    </GameLayout>
  );
}
