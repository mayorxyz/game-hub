import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

type Board = (string | null)[];
const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function checkWinner(board: Board): string | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function minimax(board: Board, isMaximizing: boolean): number {
  const winner = checkWinner(board);
  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  if (board.every(cell => cell !== null)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function getBestMove(board: Board): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [wins, setWins] = useState(0);
  const [highScore, setHS] = useState(getHighScore('tic-tac-toe'));

  const handleClick = (idx: number) => {
    if (board[idx] || gameOver || !isPlayerTurn) return;
    const newBoard = [...board];
    newBoard[idx] = 'X';
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setGameOver(true);
      setResult('You win! 🎉');
      setWins(w => {
        const nw = w + 1;
        setHS(h => {
          const best = Math.max(h, nw);
          setHighScore('tic-tac-toe', best);
          return best;
        });
        return nw;
      });
      return;
    }
    if (newBoard.every(cell => cell !== null)) {
      setGameOver(true);
      setResult("Draw!");
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(() => {
      const botMove = getBestMove(newBoard);
      newBoard[botMove] = 'O';
      setBoard(newBoard);
      const botWinner = checkWinner(newBoard);
      if (botWinner) {
        setGameOver(true);
        setResult('Bot wins! 🤖');
      } else if (newBoard.every(cell => cell !== null)) {
        setGameOver(true);
        setResult("Draw!");
      }
      setIsPlayerTurn(true);
    }, 300);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult(null);
  };

  return (
    <GameLayout title="Tic-Tac-Toe" score={`Wins: ${wins}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center gap-4">
        {result && <p className="text-xl font-bold text-amber-400">{result}</p>}
        <div className="grid grid-cols-3 gap-2 w-60 h-60 sm:w-72 sm:h-72">
          {board.map((cell, i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              className={`rounded-xl text-3xl sm:text-4xl font-bold flex items-center justify-center transition-all ${
                cell === 'X' ? 'bg-blue-600 text-white' :
                cell === 'O' ? 'bg-red-600 text-white' :
                'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              {cell}
            </button>
          ))}
        </div>
        <p className="text-gray-500 text-sm">You are X · Bot is O (unbeatable)</p>
      </div>
    </GameLayout>
  );
}
