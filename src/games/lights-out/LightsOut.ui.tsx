import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  Board,
  GRID_SIZE,
  GameState,
  createInitialState,
  toggle,
  checkWin,
} from './LightsOut';
import { handleCellClick } from './LightsOut.controls';

export default function LightsOut() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const storedBest = getHighScore('lights-out');
  const [bestMoves, setBestMoves] = useState<number>(storedBest > 0 ? 10000 - storedBest : Infinity);

  const handleCellClickHandler = useCallback((r: number, c: number) => {
    if (gameState.isWon) return;
    
    handleCellClick(gameState.board, r, c, (newBoard) => {
      const newMoves = gameState.moves + 1;
      const isWon = checkWin(newBoard);
      
      setGameState({
        board: newBoard,
        moves: newMoves,
        isWon,
      });
    });
  }, [gameState]);

  // Update high score when game is won
  useEffect(() => {
    if (gameState.isWon && gameState.moves < bestMoves) {
      setBestMoves(gameState.moves);
      setHighScore('lights-out', 10000 - gameState.moves);
    }
  }, [gameState.isWon, gameState.moves, bestMoves]);

  const reset = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  return (
    <GameLayout
      title="Lights Out"
      score={`${gameState.moves} moves`}
      highScore={bestMoves !== Infinity ? bestMoves : undefined}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.isWon && <p className="text-green-400">🎉 All lights out!</p>}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div
            className="absolute inset-0 grid gap-2 p-2"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
            }}
          >
            {gameState.board.flat().map((v, i) => {
              const r = Math.floor(i / GRID_SIZE);
              const c = i % GRID_SIZE;
              return (
                <button
                  key={i}
                  onClick={() => handleCellClickHandler(r, c)}
                  className={`rounded-lg transition-all touch-none ${
                    v ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                />
              );
            })}
          </div>
        </div>
        
        <p className="text-gray-500 text-xs">Turn off all the lights</p>
      </div>
    </GameLayout>
  );
}
