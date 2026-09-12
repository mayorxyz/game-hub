import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import { useGridKeyNav } from '../../hooks/useGridKeyNav';
import {
  Board,
  GRID_SIZE,
  GameState,
  createInitialState,
  toggle,
  checkWin,
} from './LightsOut';
import { handleCellClick } from './LightsOut.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';
import DifficultySelector from '../../components/ui/DifficultySelector';

export default function LightsOut() {
  const { difficulty, setDifficulty } = useDifficulty();
  const gridSize = Math.max(3, applyDifficulty(GRID_SIZE, getDifficultySettings(difficulty), 'size'));

  const [gameState, setGameState] = useState<GameState>(() => loadSavedState<GameState>('lights-out', d => d as GameState) ?? createInitialState(gridSize));
  const storedBest = getHighScore('lights-out');
  const [bestMoves, setBestMoves] = useState<number>(storedBest > 0 ? 10000 - storedBest : Infinity);
  const { record } = useGameResult('lights-out');
  useGameStatePersistence("lights-out", gameState, s => s, s => !s.isWon);
  const play = useSound();
  const { onKeyDown } = useGridKeyNav(gridSize);

    useEffect(() => {
    if (gameState.isWon) {
      record({ won: true, score: 10000 - gameState.moves });
    }
  }, [gameState.isWon]);

  const handleCellClickHandler = useCallback((r: number, c: number) => {
    play('click');
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
    clearSavedState('lights-out');
    setGameState(createInitialState(gridSize));
  }, [gridSize]);

  return (
    <GameLayout
      title="Lights Out"
      score={`${gameState.moves} moves`}
      highScore={bestMoves !== Infinity ? bestMoves : undefined}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.isWon && <p className="text-green-400">🎉 All lights out!</p>}

        {/* Difficulty Selector */}
        <DifficultySelector
          value={difficulty}
          onChange={(newDifficulty) => {
            setDifficulty(newDifficulty);
            // Grid size is baked into the state, so start a fresh puzzle.
            const newSize = Math.max(3, applyDifficulty(GRID_SIZE, getDifficultySettings(newDifficulty), 'size'));
            setGameState(createInitialState(newSize));
          }}
        />

        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div
            className="absolute inset-0 grid gap-2 p-2" onKeyDown={onKeyDown}
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {gameState.board.flat().map((v, i) => {
              const r = Math.floor(i / gridSize);
              const c = i % gridSize;
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
