import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useSound } from '../../hooks/useSound';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import {
  SudokuState,
  BASE_REMOVED_CELLS,
  createInitialState,
  resetGame,
  isCellOriginal,
  isCellError,
} from './Sudoku';
import { handleCellClick, handleNumberInput } from './Sudoku.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';
import DifficultySelector from '../../components/ui/DifficultySelector';

export default function Sudoku({ daily = false, dailySeed }: { daily?: boolean; dailySeed?: number }) {
  const { difficulty, setDifficulty } = useDifficulty();
  // More removed cells = fewer givens = harder puzzle.
  const removedCells = Math.min(60, Math.max(30, applyDifficulty(BASE_REMOVED_CELLS, getDifficultySettings(difficulty), 'complexity')));

  const [gameState, setGameState] = useState<SudokuState>(() => {
    if (!daily) {
      const saved = loadSavedState<SudokuState>('sudoku', d => d as SudokuState);
      if (saved && !saved.isWon) return saved;
    }
    return createInitialState(daily ? dailySeed : undefined, removedCells);
  });
  const [bestErr, setBestErr] = useState<number>(
    getHighScore('sudoku') > 0 ? 10000 - getHighScore('sudoku') : Infinity
  );

  const { record } = useGameResult('sudoku', { daily });
  const play = useSound();
  useGameStatePersistence('sudoku', gameState, s => s, s => !s.isWon);

  const onStateChange = (newState: SudokuState) => {
    setGameState(newState);
    if (newState.isWon && newState.errors < bestErr) {
      setBestErr(newState.errors);
      setHighScore('sudoku', 10000 - newState.errors);
    }
  };

  const onCellClick = (row: number, col: number) => {
    handleCellClick(gameState, row, col, onStateChange);
  };

  const onNumberInput = (num: number) => {
    play('click');
    handleNumberInput(gameState, num, onStateChange);
  };

  useEffect(() => {
    if (gameState.isWon) {
      record({ won: true, score: 10000 - gameState.errors });
    }
  }, [gameState.isWon]);

  const onReset = () => {
    clearSavedState('sudoku');
    setGameState(resetGame(daily ? dailySeed : undefined, removedCells));
    setBestErr(getHighScore('sudoku') > 0 ? 10000 - getHighScore('sudoku') : Infinity);
  };

  return (
    <GameLayout
      title="Sudoku"
      score={`Errors: ${gameState.errors}`}
      highScore={bestErr !== Infinity ? bestErr : undefined}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.isWon && <p className="text-green-400">🎉 Solved!</p>}

        {/* Difficulty Selector */}
        <DifficultySelector
          value={difficulty}
          onChange={(newDifficulty) => {
            setDifficulty(newDifficulty);
            // The puzzle is generated with the difficulty's given count, so start a fresh one.
            const newRemoved = Math.min(60, Math.max(30, applyDifficulty(BASE_REMOVED_CELLS, getDifficultySettings(newDifficulty), 'complexity')));
            clearSavedState('sudoku');
            setGameState(createInitialState(daily ? dailySeed : undefined, newRemoved));
          }}
        />

        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid grid-cols-9 gap-0 border-2 border-gray-500 rounded overflow-hidden">
            {gameState.currentBoard.flat().map((v, i) => {
              const row = Math.floor(i / 9);
              const col = i % 9;
              const orig = isCellOriginal(gameState, row, col);
              const isSel = gameState.selectedCell && gameState.selectedCell[0] === row && gameState.selectedCell[1] === col;
              const isErr = isCellError(gameState, row, col);
              return (
                <button
                  key={i}
                  onClick={() => onCellClick(row, col)}
                  className={`flex items-center justify-center text-xs sm:text-sm font-bold border border-gray-700 min-h-[48px] min-w-[48px] ${
                    isSel ? 'bg-purple-700' : isErr ? 'bg-red-900/50' : orig ? 'bg-gray-800' : 'bg-gray-900 hover:bg-gray-800'
                  } ${col % 3 === 2 && col < 8 ? 'border-r-2 border-r-gray-500' : ''} ${
    row % 3 === 2 && row < 8 ? 'border-b-2 border-b-gray-500' : ''
                  }`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {v || ''}
                </button>
              );
            })}
          </div>
        </div>

        {/* Number Pad */}
        <div className="flex gap-1 sm:gap-2 flex-wrap justify-center">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
              <button
                key={n}
                onClick={() => onNumberInput(n)}
                className="min-w-[48px] min-h-[48px] px-3 py-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg font-bold text-sm sm:text-base"
                style={{ touchAction: 'manipulation' }}
              >
                {n || '⌫'}
              </button>
            ))}
        </div>
      </div>
    </GameLayout>
  );
}
