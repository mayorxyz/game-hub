import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

const SIZE = 10;
type CellState = 'empty' | 'miss' | 'hit';

function placeShips(): boolean[][] {
  const grid: boolean[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const ships = [5, 4, 3, 3, 2];
  for (const size of ships) {
    let placed = false;
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const horizontal = Math.random() > 0.5;
      const r = Math.floor(Math.random() * (horizontal ? SIZE : SIZE - size + 1));
      const c = Math.floor(Math.random() * (horizontal ? SIZE - size + 1 : SIZE));
      let canPlace = true;
      for (let i = 0; i < size; i++) {
        const cr = horizontal ? r : r + i;
        const cc = horizontal ? c + i : c;
        if (grid[cr][cc]) { canPlace = false; break; }
      }
      if (canPlace) {
        for (let i = 0; i < size; i++) {
          const cr = horizontal ? r : r + i;
          const cc = horizontal ? c + i : c;
          grid[cr][cc] = true;
        }
        placed = true;
      }
    }
  }
  return grid;
}

function botGuess(board: CellState[][]): [number, number] {
  const prob: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  const ships = [5, 4, 3, 3, 2];
  for (const size of ships) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (c + size <= SIZE) {
          let valid = true;
          for (let i = 0; i < size; i++) {
            const s = board[r][c + i];
            if (s === 'miss' || s === 'hit') { valid = false; break; }
          }
          if (valid) for (let i = 0; i < size; i++) prob[r][c + i]++;
        }
        if (r + size <= SIZE) {
          let valid = true;
          for (let i = 0; i < size; i++) {
            const s = board[r + i][c];
            if (s === 'miss' || s === 'hit') { valid = false; break; }
          }
          if (valid) for (let i = 0; i < size; i++) prob[r + i][c]++;
        }
      }
    }
  }
  let maxProb = 0;
  let bestMoves: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (board[r][c] === 'empty' && prob[r][c] > maxProb) {
      maxProb = prob[r][c];
      bestMoves = [[r, c]];
    } else if (board[r][c] === 'empty' && prob[r][c] === maxProb && maxProb > 0) {
      bestMoves.push([r, c]);
    }
  }
  if (bestMoves.length === 0) {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 'empty') bestMoves.push([r, c]);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

export default function Battleship() {
  const [ships] = useState(() => placeShips());
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>(() => Array.from({ length: SIZE }, () => Array(SIZE).fill('empty')));
  const [botBoard, setBotBoard] = useState<CellState[][]>(() => Array.from({ length: SIZE }, () => Array(SIZE).fill('empty')));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');
  const [highScore, setHS] = useState(getHighScore('battleship'));
  const [playerHits, setPlayerHits] = useState(0);
  const totalShipCells = ships.flat().filter(Boolean).length;

  const handleAttack = (r: number, c: number) => {
    if (gameOver || !isPlayerTurn || playerBoard[r][c] !== 'empty') return;
    const nb = playerBoard.map(row => [...row]);
    const isHit = ships[r][c];
    nb[r][c] = isHit ? 'hit' : 'miss';
    setPlayerBoard(nb);

    const newHits = isHit ? playerHits + 1 : playerHits;
    setPlayerHits(newHits);

    if (newHits >= totalShipCells) {
      setGameOver(true);
      setResult('You win! 🎉');
      setHS(h => {
        const best = Math.max(h, 1000);
        setHighScore('battleship', best);
        return best;
      });
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(() => {
      const unguessed: [number, number][] = [];
      for (let rr = 0; rr < SIZE; rr++) for (let cc = 0; cc < SIZE; cc++) {
        if (playerBoard[rr][cc] === 'empty') unguessed.push([rr, cc]);
      }
      if (unguessed.length > 0) {
        const [ar, ac] = botGuess(playerBoard);
        const actualHit = ships[ar][ac];
        const nb3 = playerBoard.map(row => [...row]);
        nb3[ar][ac] = actualHit ? 'hit' : 'miss';
        setPlayerBoard(nb3);
        if (actualHit) {
          const playerShipCells = nb3.flat().filter(c => c === 'hit').length;
          if (playerShipCells >= totalShipCells) {
            setGameOver(true);
            setResult('Bot wins! 🤖');
            return;
          }
        }
      }
      setIsPlayerTurn(true);
    }, 500);
  };

  const reset = () => window.location.reload();

  return (
    <GameLayout title="Battleship" score={`Hits: ${playerHits}/${totalShipCells}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center gap-4">
        {result && <p className="text-xl font-bold text-amber-400">{result}</p>}
        <p className="text-gray-400 text-sm">Your board (tap to attack bot's board below)</p>
        <div className="inline-grid gap-[1px] bg-gray-700 p-1 rounded" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
          {playerBoard.flat().map((cell, i) => (
            <div key={i} className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs rounded-sm ${
              cell === 'hit' ? 'bg-red-600' : cell === 'miss' ? 'bg-blue-900' : 'bg-gray-800'
            }`}>
              {cell === 'hit' ? '💥' : cell === 'miss' ? '·' : ''}
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-sm">Bot's board (tap cells to attack)</p>
        <div className="inline-grid gap-[1px] bg-gray-700 p-1 rounded" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
          {playerBoard.flat().map((_, i) => {
            const r = Math.floor(i / SIZE), c = i % SIZE;
            const cell = botBoard[r][c];
            return (
              <button
                key={i}
                onClick={() => handleAttack(r, c)}
                disabled={!isPlayerTurn || cell !== 'empty'}
                className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs rounded-sm ${
                  cell === 'hit' ? 'bg-red-600' : cell === 'miss' ? 'bg-blue-900' : 'bg-gray-800 hover:bg-gray-600'
                }`}
              >
                {cell === 'hit' ? '🔥' : cell === 'miss' ? '·' : ''}
              </button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
}
