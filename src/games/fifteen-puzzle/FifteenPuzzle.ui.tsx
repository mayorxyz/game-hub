import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  BOARD_SIZE,
  GameState,
  createInitialState,
  makeMove,
  isWon,
} from './FifteenPuzzle';
import { handleTileClick } from './FifteenPuzzle.controls';

export default function FifteenPuzzle() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const storedBest = getHighScore('fifteen-puzzle');
  const [bestMoves, setBestMoves] = useState<number>(storedBest > 0 ? 10000 - storedBest : Infinity);

  const onMove = useCallback((idx: number) => {
    const newBoard = makeMove(gameState.board, idx);
    const won = isWon(newBoard);
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      moves: prev.moves + 1,
      isWon: won,
    }));
  }, [gameState.board]);

  const onTileClick = useCallback((idx: number) => {
    handleTileClick(gameState.board, idx, gameState.isWon, onMove);
  }, [gameState.board, gameState.isWon, onMove]);

  const reset = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  useEffect(() => {
    if (gameState.isWon && gameState.moves > 0 && gameState.moves < bestMoves) {
      setBestMoves(gameState.moves);
      setHighScore('fifteen-puzzle', 10000 - gameState.moves);
    }
  }, [gameState.isWon, gameState.moves, bestMoves]);

  return (
    <GameLayout
      title="15 Puzzle"
      score={`${gameState.moves} moves`}
      highScore={bestMoves !== Infinity ? bestMoves : undefined}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.isWon && <p className="text-green-400">🎉 Solved!</p>}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid grid-cols-4 gap-1 bg-gray-800 p-2 rounded-xl">
            {gameState.board.map((v, i) => (
              <button
                key={i}
                onClick={() => onTileClick(i)}
                className={`aspect-square flex items-center justify-center rounded-lg text-lg sm:text-xl font-bold ${
                  v === 0 ? 'bg-transparent' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                {v || ''}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
