import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  Board,
  COLS,
  GameState,
  createInitialState,
  dropPiece,
  checkWin,
  isBoardFull,
  getBestMove,
} from './ConnectFour';
import { handleColumnClick } from './ConnectFour.controls';

export default function ConnectFour() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('connect-four'));
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Handle player move
  const onPlayerDrop = useCallback((col: number) => {
    const newBoard = dropPiece(gameState.board, col, 1);
    if (!newBoard) return;
    
    setGameState(prev => ({ ...prev, board: newBoard }));

    if (checkWin(newBoard, 1)) {
      const newWins = gameState.wins + 1;
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        result: 'You win! 🎉',
        wins: newWins,
      }));
      setHighScoreState(prev => {
        const best = Math.max(prev, newWins);
        setHighScore('connect-four', best);
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
      const botCol = getBestMove(newBoard);
      const botBoard = dropPiece(newBoard, botCol, 2);
      if (botBoard) {
        setGameState(prev => ({ ...prev, board: botBoard }));
        
        if (checkWin(botBoard, 2)) {
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
      }
      setGameState(prev => ({ ...prev, isPlayerTurn: true }));
    }, 400);
  }, [gameState.board, gameState.wins]);

  const onColumnClick = useCallback((col: number) => {
    handleColumnClick(
      gameState.board,
      col,
      gameState.isGameOver,
      gameState.isPlayerTurn,
      onPlayerDrop
    );
  }, [gameState.board, gameState.isGameOver, gameState.isPlayerTurn, onPlayerDrop]);

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
      title="Connect Four"
      score={`Wins: ${gameState.wins}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.result && (
          <p className="text-xl font-bold text-amber-400">{gameState.result}</p>
        )}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-[7/6]">
          <div className="absolute inset-0 bg-blue-800 p-2 sm:p-3 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 h-full">
              {gameState.board.flat().map((cell, i) => (
                <button
                  key={i}
                  onClick={() => onColumnClick(i % COLS)}
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
