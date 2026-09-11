import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  Board,
  GameState,
  createInitialState,
  checkWinner,
  isBoardFull,
  getBestMove,
  makeMove,
} from './TicTacToe';
import { handleCellClick } from './TicTacToe.controls';

export default function TicTacToe() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('tic-tac-toe'));
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Handle player move
  const onPlayerMove = useCallback((idx: number) => {
    const newBoard = makeMove(gameState.board, idx, 'X');
    setGameState(prev => ({ ...prev, board: newBoard }));

    const winner = checkWinner(newBoard);
    if (winner) {
      const newWins = gameState.wins + 1;
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        result: 'You win! 🎉',
        wins: newWins,
      }));
      setHighScoreState(prev => {
        const best = Math.max(prev, newWins);
        setHighScore('tic-tac-toe', best);
        return best;
      });
      return;
    }

    if (isBoardFull(newBoard)) {
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        result: 'Draw!',
      }));
      return;
    }

    setGameState(prev => ({ ...prev, isPlayerTurn: false }));

    // Bot move
    botTimeoutRef.current = setTimeout(() => {
      const botMove = getBestMove(newBoard);
      const botBoard = makeMove(newBoard, botMove, 'O');
      setGameState(prev => ({ ...prev, board: botBoard }));

      const botWinner = checkWinner(botBoard);
      if (botWinner) {
        setGameState(prev => ({
          ...prev,
          isGameOver: true,
          result: 'Bot wins! 🤖',
        }));
      } else if (isBoardFull(botBoard)) {
        setGameState(prev => ({
          ...prev,
          isGameOver: true,
          result: 'Draw!',
        }));
      }
      setGameState(prev => ({ ...prev, isPlayerTurn: true }));
    }, 300);
  }, [gameState.board, gameState.wins]);

  const onCellClick = useCallback((idx: number) => {
    handleCellClick(
      gameState.board,
      idx,
      gameState.isGameOver,
      gameState.isPlayerTurn,
      onPlayerMove
    );
  }, [gameState.board, gameState.isGameOver, gameState.isPlayerTurn, onPlayerMove]);

  const reset = useCallback(() => {
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
    }
    setGameState(createInitialState());
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
      }
    };
  }, []);

  return (
    <GameLayout
      title="Tic-Tac-Toe"
      score={`Wins: ${gameState.wins}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.result && (
          <p className="text-xl font-bold text-amber-400">{gameState.result}</p>
        )}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid grid-cols-3 gap-2">
            {gameState.board.map((cell, i) => (
              <button
                key={i}
                onClick={() => onCellClick(i)}
                className={`rounded-xl text-3xl sm:text-4xl font-bold flex items-center justify-center transition-all min-h-[48px] min-w-[48px] ${
                  cell === 'X' ? 'bg-blue-600 text-white' :
                  cell === 'O' ? 'bg-red-600 text-white' :
                  'bg-gray-700 hover:bg-gray-600 active:bg-gray-500'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-gray-500 text-sm">You are X · Bot is O (unbeatable)</p>
      </div>
    </GameLayout>
  );
}
