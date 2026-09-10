import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

type Board = number[][];
const SIZE = 8;
const DIRS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

function createBoard(): Board {
  const b = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  b[3][3] = 2; b[3][4] = 1; b[4][3] = 1; b[4][4] = 2;
  return b;
}

function getFlips(board: Board, r: number, c: number, player: number): [number, number][] {
  if (board[r][c] !== 0) return [];
  const opp = player === 1 ? 2 : 1;
  const flips: [number, number][] = [];
  for (const [dr, dc] of DIRS) {
    const temp: [number, number][] = [];
    let nr = r + dr, nc = c + dc;
    while (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === opp) {
      temp.push([nr, nc]);
      nr += dr;
      nc += dc;
    }
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[nr][nc] === player && temp.length > 0) {
      flips.push(...temp);
    }
  }
  return flips;
}

function getValidMoves(board: Board, player: number): [number, number][] {
  const moves: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (getFlips(board, r, c, player).length > 0) moves.push([r, c]);
    }
  }
  return moves;
}

function applyMove(board: Board, r: number, c: number, player: number): Board {
  const nb = board.map(row => [...row]);
  const flips = getFlips(nb, r, c, player);
  nb[r][c] = player;
  flips.forEach(([fr, fc]) => { nb[fr][fc] = player; });
  return nb;
}

function countPieces(board: Board, player: number): number {
  return board.flat().filter(c => c === player).length;
}

function evaluate(board: Board, player: number): number {
  let score = 0;
  const corners = [[0,0],[0,7],[7,0],[7,7]];
  const opp = player === 1 ? 2 : 1;
  corners.forEach(([r, c]) => {
    if (board[r][c] === player) score += 50;
    else if (board[r][c] === opp) score -= 50;
  });
  score += countPieces(board, player) - countPieces(board, opp);
  return score;
}

function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, player: number, opponent: number): number {
  if (depth === 0 || (getValidMoves(board, 1).length === 0 && getValidMoves(board, 2).length === 0)) {
    return evaluate(board, player);
  }

  const currentPlayer = maximizing ? player : opponent;
  const moves = getValidMoves(board, currentPlayer);
  if (moves.length === 0) {
    return minimax(board, depth - 1, alpha, beta, !maximizing, player, opponent);
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const [r, c] of moves) {
      const nb = applyMove(board, r, c, currentPlayer);
      const eval_ = minimax(nb, depth - 1, alpha, beta, false, player, opponent);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const [r, c] of moves) {
      const nb = applyMove(board, r, c, currentPlayer);
      const eval_ = minimax(nb, depth - 1, alpha, beta, true, player, opponent);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMove(board: Board): [number, number] {
  const moves = getValidMoves(board, 2);
  let bestScore = -Infinity;
  let bestMove = moves[0];
  for (const [r, c] of moves) {
    const nb = applyMove(board, r, c, 2);
    const score = minimax(nb, 4, -Infinity, Infinity, false, 2, 1);
    if (score > bestScore) {
      bestScore = score;
      bestMove = [r, c];
    }
  }
  return bestMove;
}

export default function Reversi() {
  const [board, setBoard] = useState<Board>(createBoard);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');
  const [wins, setWins] = useState(0);
  const [highScore, setHS] = useState(getHighScore('reversi'));

  // Auto-pass if player has no valid moves
  useEffect(() => {
    if (gameOver || !isPlayerTurn) return;
    const playerMoves = getValidMoves(board, 1);
    const botMoves = getValidMoves(board, 2);
    
    if (playerMoves.length === 0) {
      if (botMoves.length === 0) {
        // Game over
        const p = countPieces(board, 1), b = countPieces(board, 2);
        setGameOver(true);
        setResult(p > b ? 'You win! 🎉' : p < b ? 'Bot wins!' : 'Draw!');
        if (p > b) {
          setWins(w => {
            const nw = w + 1;
            setHS(h => {
              const best = Math.max(h, nw);
              setHighScore('reversi', best);
              return best;
            });
            return nw;
          });
        }
      } else {
        // Player passes, bot goes
        setIsPlayerTurn(false);
        setTimeout(() => {
          const [br, bc] = getBestMove(board);
          const nb = applyMove(board, br, bc, 2);
          setBoard(nb);
          setIsPlayerTurn(true);
        }, 400);
      }
    }
  }, [board, isPlayerTurn, gameOver]);

  const handleClick = (r: number, c: number) => {
    if (gameOver || !isPlayerTurn) return;
    const flips = getFlips(board, r, c, 1);
    if (flips.length === 0) return;
    const nb = applyMove(board, r, c, 1);
    setBoard(nb);

    const botMoves = getValidMoves(nb, 2);
    const playerMoves = getValidMoves(nb, 1);
    if (botMoves.length === 0 && playerMoves.length === 0) {
      const p = countPieces(nb, 1), b = countPieces(nb, 2);
      setGameOver(true);
      setResult(p > b ? 'You win! 🎉' : p < b ? 'Bot wins!' : 'Draw!');
      if (p > b) {
        setWins(w => {
          const nw = w + 1;
          setHS(h => {
            const best = Math.max(h, nw);
            setHighScore('reversi', best);
            return best;
          });
          return nw;
        });
      }
      return;
    }
    if (botMoves.length === 0) return;

    setIsPlayerTurn(false);
    setTimeout(() => {
      const [br, bc] = getBestMove(nb);
      const nb2 = applyMove(nb, br, bc, 2);
      setBoard(nb2);
      const pm = getValidMoves(nb2, 1);
      const bm = getValidMoves(nb2, 2);
      if (pm.length === 0 && bm.length === 0) {
        const p = countPieces(nb2, 1), b = countPieces(nb2, 2);
        setGameOver(true);
        setResult(p > b ? 'You win! 🎉' : p < b ? 'Bot wins!' : 'Draw!');
        if (p > b) {
          setWins(w => {
            const nw = w + 1;
            setHS(h => {
              const best = Math.max(h, nw);
              setHighScore('reversi', best);
              return best;
            });
            return nw;
          });
        }
      } else if (pm.length === 0) {
        // Player has no moves, bot goes again
        setTimeout(() => {
          const [br2, bc2] = getBestMove(nb2);
          const nb3 = applyMove(nb2, br2, bc2, 2);
          setBoard(nb3);
          const pm2 = getValidMoves(nb3, 1);
          const bm2 = getValidMoves(nb3, 2);
          if (pm2.length === 0 && bm2.length === 0) {
            const p = countPieces(nb3, 1), b = countPieces(nb3, 2);
            setGameOver(true);
            setResult(p > b ? 'You win! 🎉' : p < b ? 'Bot wins!' : 'Draw!');
            if (p > b) {
              setWins(w => {
                const nw = w + 1;
                setHS(h => {
                  const best = Math.max(h, nw);
                  setHighScore('reversi', best);
                  return best;
                });
                return nw;
              });
            }
          } else {
            setIsPlayerTurn(true);
          }
        }, 400);
      } else {
        setIsPlayerTurn(true);
      }
    }, 400);
  };

  const validMoves = isPlayerTurn ? getValidMoves(board, 1) : [];
  const reset = () => {
    setBoard(createBoard());
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult('');
  };

  return (
    <GameLayout title="Reversi" score={`⚫${countPieces(board,1)} ⚪${countPieces(board,2)}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {result && <p className="text-xl font-bold text-amber-400">{result}</p>}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 bg-green-800 p-2 rounded-xl overflow-hidden">
            <div className="grid gap-[1px] h-full" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gridTemplateRows: `repeat(${SIZE}, 1fr)` }}>
              {board.flat().map((cell, i) => {
                const r = Math.floor(i / SIZE), c = i % SIZE;
                const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
                return (
                  <button
                    key={i}
                    onClick={() => handleClick(r, c)}
                    className={`flex items-center justify-center rounded-sm min-h-[48px] min-w-[48px] ${isValid ? 'bg-green-600 hover:bg-green-500 active:bg-green-500' : 'bg-green-700'}`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {cell === 1 && <div className="w-3/4 h-3/4 rounded-full bg-gray-900" />}
                    {cell === 2 && <div className="w-3/4 h-3/4 rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        <p className="text-gray-500 text-xs">You are ⚫ · Bot is ⚪</p>
      </div>
    </GameLayout>
  );
}
