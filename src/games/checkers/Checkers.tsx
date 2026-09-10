import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

const SIZE = 8;
type Piece = { player: 1 | 2; king: boolean } | null;
type Board = Piece[][];

function createBoard(): Board {
  const b: Board = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  for (let r = 0; r < 3; r++) for (let c = 0; c < SIZE; c++) if ((r + c) % 2 === 1) b[r][c] = { player: 2, king: false };
  for (let r = 5; r < 8; r++) for (let c = 0; c < SIZE; c++) if ((r + c) % 2 === 1) b[r][c] = { player: 1, king: false };
  return b;
}

function getMoves(board: Board, r: number, c: number): { to: [number, number]; captures: [number, number][] }[] {
  const piece = board[r][c];
  if (!piece) return [];
  const moves: { to: [number, number]; captures: [number, number][] }[] = [];
  const dirs = piece.king ? [[-1,-1],[-1,1],[1,-1],[1,1]] : piece.player === 1 ? [[-1,-1],[-1,1]] : [[1,-1],[1,1]];
  for (const [dr, dc] of dirs) {
    const nr = r + dr, nc = c + dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && !board[nr][nc]) {
      moves.push({ to: [nr, nc], captures: [] });
    }
  }
  const opp = piece.player === 1 ? 2 : 1;
  for (const [dr, dc] of dirs) {
    const mr = r + dr, mc = c + dc;
    const nr = r + 2*dr, nc = c + 2*dc;
    if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && board[mr]?.[mc]?.player === opp && !board[nr][nc]) {
      moves.push({ to: [nr, nc], captures: [[mr, mc]] });
    }
  }
  return moves;
}

function getAllMoves(board: Board, player: 1 | 2): { from: [number, number]; to: [number, number]; captures: [number, number][] }[] {
  const all: { from: [number, number]; to: [number, number]; captures: [number, number][] }[] = [];
  let hasCaptures = false;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (board[r][c]?.player === player) {
      const moves = getMoves(board, r, c);
      for (const m of moves) {
        if (m.captures.length > 0) hasCaptures = true;
        all.push({ from: [r, c], ...m });
      }
    }
  }
  return hasCaptures ? all.filter(m => m.captures.length > 0) : all;
}

function applyMove(board: Board, from: [number, number], to: [number, number], captures: [number, number][]): Board {
  const nb = board.map(row => row.map(cell => cell ? { ...cell } : null));
  const piece = nb[from[0]][from[1]]!;
  nb[from[0]][from[1]] = null;
  nb[to[0]][to[1]] = piece;
  captures.forEach(([cr, cc]) => { nb[cr][cc] = null; });
  if (piece.player === 1 && to[0] === 0) piece.king = true;
  if (piece.player === 2 && to[0] === SIZE - 1) piece.king = true;
  return nb;
}

function botMove(board: Board): { from: [number, number]; to: [number, number]; captures: [number, number][] } | null {
  const moves = getAllMoves(board, 2);
  if (moves.length === 0) return null;
  const captures = moves.filter(m => m.captures.length > 0);
  if (captures.length > 0) return captures[Math.floor(Math.random() * captures.length)];
  return moves[Math.floor(Math.random() * moves.length)];
}

export default function Checkers() {
  const [board, setBoard] = useState<Board>(createBoard);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');
  const [wins, setWins] = useState(0);
  const [highScore, setHS] = useState(getHighScore('checkers'));

  const handleClick = (r: number, c: number) => {
    if (gameOver || !isPlayerTurn) return;
    if (selected) {
      const moves = getAllMoves(board, 1);
      const move = moves.find(m => m.from[0] === selected[0] && m.from[1] === selected[1] && m.to[0] === r && m.to[1] === c);
      if (move) {
        const nb = applyMove(board, move.from, move.to, move.captures);
        setBoard(nb);
        setSelected(null);
        const botMoves = getAllMoves(nb, 2);
        const playerMoves = getAllMoves(nb, 1);
        if (botMoves.length === 0 && playerMoves.length === 0) {
          setGameOver(true);
          setResult('Game Over!');
          return;
        }
        if (botMoves.length === 0) {
          setGameOver(true);
          setResult('You win! 🎉');
          setWins(w => {
            const nw = w + 1;
            setHS(h => {
              const best = Math.max(h, nw);
              setHighScore('checkers', best);
              return best;
            });
            return nw;
          });
          return;
        }
        setIsPlayerTurn(false);
        setTimeout(() => {
          const bm = botMove(nb);
          if (bm) {
            const nb2 = applyMove(nb, bm.from, bm.to, bm.captures);
            setBoard(nb2);
            const pm = getAllMoves(nb2, 1);
            if (pm.length === 0) {
              setGameOver(true);
              setResult('Bot wins! 🤖');
            }
          } else {
            setGameOver(true);
            setResult('You win! 🎉');
            setWins(w => {
              const nw = w + 1;
              setHS(h => {
                const best = Math.max(h, nw);
                setHighScore('checkers', best);
                return best;
              });
              return nw;
            });
          }
          setIsPlayerTurn(true);
        }, 500);
      } else {
        setSelected(null);
      }
    } else {
      if (board[r][c]?.player === 1) setSelected([r, c]);
    }
  };

  const validMoves = selected ? getAllMoves(board, 1).filter(m => m.from[0] === selected[0] && m.from[1] === selected[1]) : [];
  const reset = () => {
    setBoard(createBoard());
    setSelected(null);
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult('');
  };

  return (
    <GameLayout title="Checkers" score={`Wins: ${wins}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {result && <p className="text-xl font-bold text-amber-400">{result}</p>}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid gap-0 border-2 border-gray-600 rounded overflow-hidden" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gridTemplateRows: `repeat(${SIZE}, 1fr)` }}>
            {board.flat().map((piece, i) => {
              const r = Math.floor(i / SIZE), c = i % SIZE;
              const isDark = (r + c) % 2 === 1;
              const isSelected = selected && selected[0] === r && selected[1] === c;
              const isValidTarget = validMoves.some(m => m.to[0] === r && m.to[1] === c);
              return (
                <button
                  key={i}
                  onClick={() => handleClick(r, c)}
                  className={`flex items-center justify-center min-h-[48px] min-w-[48px] ${isDark ? 'bg-green-800' : 'bg-amber-100'} ${isValidTarget ? 'ring-2 ring-yellow-400' : ''} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {piece && (
                    <div className={`w-3/4 h-3/4 rounded-full flex items-center justify-center text-xs font-bold ${
                      piece.player === 1 ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
                    }`}>
                      {piece.king ? '♛' : ''}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        <p className="text-gray-500 text-xs">You are red · Bot is black</p>
      </div>
    </GameLayout>
  );
}
