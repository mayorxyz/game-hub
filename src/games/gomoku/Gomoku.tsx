import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

const SIZE = 15;
const WIN = 5;
type Board = number[][];

function createBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function checkWin(board: Board, player: number): boolean {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      for (const [dr, dc] of dirs) {
        let count = 0;
        for (let i = 0; i < WIN; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === player) count++;
          else break;
        }
        if (count >= WIN) return true;
      }
    }
  }
  return false;
}

function evaluate(board: Board, player: number): number {
  const opp = player === 1 ? 2 : 1;
  let score = 0;
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      for (const [dr, dc] of dirs) {
        let p = 0, o = 0;
        for (let i = 0; i < WIN; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= SIZE || nc < 0 || nc >= SIZE) break;
          if (board[nr][nc] === player) p++;
          else if (board[nr][nc] === opp) o++;
        }
        if (p > 0 && o === 0) score += p * p * 10;
        if (o > 0 && p === 0) score -= o * o * 10;
      }
    }
  }
  return score;
}

function getBestMove(board: Board): [number, number] {
  let bestScore = -Infinity;
  let bestMove: [number, number] = [7, 7];
  const candidates: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== 0) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === 0) {
              if (!candidates.some(([cr, cc]) => cr === nr && cc === nc)) {
                candidates.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  }
  if (candidates.length === 0) return [7, 7];

  for (const [r, c] of candidates) {
    board[r][c] = 2;
    const s = evaluate(board, 2);
    board[r][c] = 0;
    if (s > bestScore) {
      bestScore = s;
      bestMove = [r, c];
    }
  }
  return bestMove;
}

export default function Gomoku() {
  const [board, setBoard] = useState<Board>(createBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');
  const [wins, setWins] = useState(0);
  const [highScore, setHS] = useState(getHighScore('gomoku'));

  const handleClick = (r: number, c: number) => {
    if (gameOver || !isPlayerTurn || board[r][c] !== 0) return;
    const nb = board.map(row => [...row]);
    nb[r][c] = 1;
    setBoard(nb);

    if (checkWin(nb, 1)) {
      setGameOver(true);
      setResult('You win! 🎉');
      setWins(w => {
        const nw = w + 1;
        setHS(h => {
          const best = Math.max(h, nw);
          setHighScore('gomoku', best);
          return best;
        });
        return nw;
      });
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(() => {
      const [br, bc] = getBestMove(nb);
      nb[br][bc] = 2;
      setBoard([...nb]);
      if (checkWin(nb, 2)) {
        setGameOver(true);
        setResult('Bot wins! 🤖');
      }
      setIsPlayerTurn(true);
    }, 300);
  };

  const reset = () => {
    setBoard(createBoard());
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult('');
  };

  return (
    <GameLayout title="Gomoku" score={`Wins: ${wins}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center gap-4">
        {result && <p className="text-xl font-bold text-amber-400">{result}</p>}
        <div className="bg-amber-800 p-1 rounded-lg overflow-auto max-w-full">
          <div className="inline-grid gap-0" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
            {board.flat().map((cell, i) => {
              const r = Math.floor(i / SIZE), c = i % SIZE;
              return (
                <button
                  key={i}
                  onClick={() => handleClick(r, c)}
                  className="w-5 h-5 sm:w-6 sm:h-6 border border-amber-900/50 flex items-center justify-center"
                >
                  {cell === 1 && <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gray-900" />}
                  {cell === 2 && <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white" />}
                </button>
              );
            })}
          </div>
        </div>
        <p className="text-gray-500 text-xs">Get 5 in a row! You are ⚫</p>
      </div>
    </GameLayout>
  );
}
