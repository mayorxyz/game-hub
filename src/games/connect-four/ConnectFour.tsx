import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

type Board = number[][];
const ROWS = 6, COLS = 7;

function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function dropPiece(board: Board, col: number, player: number): Board | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      const nb = board.map(row => [...row]);
      nb[r][col] = player;
      return nb;
    }
  }
  return null;
}

function checkWin(board: Board, player: number): boolean {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        let count = 0;
        for (let i = 0; i < 4; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === player) count++;
          else break;
        }
        if (count === 4) return true;
      }
    }
  }
  return false;
}

function evaluate(board: Board, player: number): number {
  let score = 0;
  for (let r = 0; r < ROWS; r++) if (board[r][3] === player) score += 3;
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        let p = 0, o = 0, empty = 0;
        for (let i = 0; i < 4; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (board[nr][nc] === player) p++;
          else if (board[nr][nc] === 0) empty++;
          else o++;
        }
        if (p === 3 && empty === 1) score += 50;
        if (p === 2 && empty === 2) score += 10;
        if (o === 3 && empty === 1) score -= 40;
      }
    }
  }
  return score;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, player: number, opponent: number): number {
  if (depth === 0 || checkWin(board, player) || checkWin(board, opponent)) {
    if (checkWin(board, player)) return 10000;
    if (checkWin(board, opponent)) return -10000;
    return evaluate(board, player);
  }

  const moves: number[] = [];
  for (let c = 0; c < COLS; c++) if (board[0][c] === 0) moves.push(c);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const col of moves) {
      const nb = dropPiece(board, col, player);
      if (nb) {
        const eval_ = minimax(nb, depth - 1, alpha, beta, false, player, opponent);
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const col of moves) {
      const nb = dropPiece(board, col, opponent);
      if (nb) {
        const eval_ = minimax(nb, depth - 1, alpha, beta, true, player, opponent);
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
}

function getBestMove(board: Board): number {
  let bestScore = -Infinity;
  let bestCol = 3;
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) {
      const nb = dropPiece(board, c, 2);
      if (nb) {
        const score = minimax(nb, 5, -Infinity, Infinity, false, 2, 1);
        if (score > bestScore) {
          bestScore = score;
          bestCol = c;
        }
      }
    }
  }
  return bestCol;
}

export default function ConnectFour() {
  const [board, setBoard] = useState<Board>(createBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');
  const [wins, setWins] = useState(0);
  const [highScore, setHS] = useState(getHighScore('connect-four'));
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const handleClick = (col: number) => {
    if (gameOver || !isPlayerTurn || board[0][col] !== 0) return;
    const nb = dropPiece(board, col, 1);
    if (!nb) return;
    setBoard(nb);

    if (checkWin(nb, 1)) {
      setGameOver(true);
      setResult('You win! 🎉');
      setWins(w => {
        const nw = w + 1;
        setHS(h => {
          const best = Math.max(h, nw);
          setHighScore('connect-four', best);
          return best;
        });
        return nw;
      });
      return;
    }
    if (nb[0].every(c => c !== 0)) {
      setGameOver(true);
      setResult('Draw!');
      return;
    }

    setIsPlayerTurn(false);
    botTimeoutRef.current = setTimeout(() => {
      const botCol = getBestMove(nb);
      const nb2 = dropPiece(nb, botCol, 2);
      if (nb2) {
        setBoard(nb2);
        if (checkWin(nb2, 2)) {
          setGameOver(true);
          setResult('Bot wins! 🤖');
        } else if (nb2[0].every(c => c !== 0)) {
          setGameOver(true);
          setResult('Draw!');
        }
      }
      setIsPlayerTurn(true);
    }, 400);
  };

  const reset = () => {
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
    }
    setBoard(createBoard());
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult('');
  };

  useEffect(() => {
    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
      }
    };
  }, []);

  return (
    <GameLayout title="Connect Four" score={`Wins: ${wins}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {result && <p className="text-xl font-bold text-amber-400">{result}</p>}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-[7/6]">
          <div className="absolute inset-0 bg-blue-800 p-2 sm:p-3 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 h-full">
              {board.flat().map((cell, i) => (
                <button
                  key={i}
                  onClick={() => handleClick(i % COLS)}
                  className={`aspect-square rounded-full transition-all min-h-[48px] min-w-[48px] ${
                    cell === 1 ? 'bg-red-500' :
                    cell === 2 ? 'bg-yellow-400' :
                    'bg-blue-900 hover:bg-blue-950 active:bg-blue-950'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                />
              ))}
            </div>
          </div>
        </div>
        
        <p className="text-gray-500 text-sm">You are 🔴 · Bot is 🟡</p>
      </div>
    </GameLayout>
  );
}
