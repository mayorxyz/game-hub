import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  Board,
  BOARD_SIZE,
  GomokuState,
  createInitialState,
  checkWin,
  getBestMove,
  makeMove,
} from './Gomoku';
import { handleCellClick } from './Gomoku.controls';

export default function Gomoku() {
  const [gameState, setGameState] = useState<GomokuState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('gomoku'));

  const onMove = useCallback((newBoard: Board) => {
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
        setHighScore('gomoku', best);
        return best;
      });
      return;
    }

    setGameState(prev => ({ ...prev, isPlayerTurn: false }));

    setTimeout(() => {
      const [br, bc] = getBestMove(newBoard);
      const botBoard = makeMove(newBoard, br, bc, 2);
      setGameState(prev => ({ ...prev, board: botBoard }));

      if (checkWin(botBoard, 2)) {
        setGameState(prev => ({
          ...prev,
          isGameOver: true,
          result: 'Bot wins! 🤖',
        }));
      }
      setGameState(prev => ({ ...prev, isPlayerTurn: true }));
    }, 300);
  }, [gameState.wins]);

  const onCellClick = useCallback((row: number, col: number) => {
    handleCellClick(
      gameState.board,
      row,
      col,
      gameState.isPlayerTurn,
      gameState.isGameOver,
      onMove
    );
  }, [gameState.board, gameState.isPlayerTurn, gameState.isGameOver, onMove]);

  const reset = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  return (
    <GameLayout
      title="Gomoku"
      score={`Wins: ${gameState.wins}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.result && <p className="text-xl font-bold text-amber-400">{gameState.result}</p>}
        
        {/* Responsive Game Grid - 15x15 high density */}
        <div className="relative w-full max-w-[min(95vw,70vh)] aspect-square">
          <div className="absolute inset-0 bg-amber-800 p-1 rounded-lg overflow-hidden">
            <div
              className="grid gap-0 h-full"
              style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
              }}
            >
              {gameState.board.flat().map((cell, i) => {
                const r = Math.floor(i / BOARD_SIZE);
                const c = i % BOARD_SIZE;
                return (
                  <button
                    key={i}
                    onClick={() => onCellClick(r, c)}
                    className="border border-amber-900/50 flex items-center justify-center min-h-[32px] min-w-[32px]"
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
        
        <p className="text-gray-500 text-xs">Get 5 in a row! You are ⚫</p>
      </div>
    </GameLayout>
  );
}
