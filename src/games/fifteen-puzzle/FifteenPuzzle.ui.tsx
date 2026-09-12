import React, { useState, useEffect, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import { useGridKeyNav } from '../../hooks/useGridKeyNav';
import {
  BOARD_SIZE,
  GameState,
  createInitialState,
  makeMove,
  isWon,
} from './FifteenPuzzle';
import { handleTileClick } from './FifteenPuzzle.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';
import DifficultySelector from '../../components/ui/DifficultySelector';

export default function FifteenPuzzle() {
  const { difficulty, setDifficulty } = useDifficulty();
  const boardSize = Math.max(3, applyDifficulty(BOARD_SIZE, getDifficultySettings(difficulty), 'size'));

  const [gameState, setGameState] = useState<GameState>(() => loadSavedState<GameState>('fifteen-puzzle', d => d as GameState) ?? createInitialState(boardSize));
  const storedBest = getHighScore('fifteen-puzzle');
  const [bestMoves, setBestMoves] = useState<number>(storedBest > 0 ? 10000 - storedBest : Infinity);
  const { record } = useGameResult('fifteen-puzzle');
  useGameStatePersistence("fifteen-puzzle", gameState, s => s, s => !s.isWon);
  const play = useSound();
  const { onKeyDown } = useGridKeyNav(boardSize);

    useEffect(() => {
    if (gameState.isWon) {
      record({ won: true, score: 10000 - gameState.moves });
    }
  }, [gameState.isWon]);

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
    play('move');
    handleTileClick(gameState.board, idx, gameState.isWon, onMove, boardSize);
  }, [gameState.board, gameState.isWon, onMove, boardSize]);

  const reset = useCallback(() => {
    clearSavedState('fifteen-puzzle');
    setGameState(createInitialState(boardSize));
  }, [boardSize]);

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

        {/* Difficulty Selector */}
        <DifficultySelector
          value={difficulty}
          onChange={(newDifficulty) => {
            setDifficulty(newDifficulty);
            // Board size is baked into the state, so start a fresh puzzle.
            const newSize = Math.max(3, applyDifficulty(BOARD_SIZE, getDifficultySettings(newDifficulty), 'size'));
            setGameState(createInitialState(newSize));
          }}
        />

        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div
            className="absolute inset-0 grid gap-1 bg-gray-800 p-2 rounded-xl" onKeyDown={onKeyDown}
            style={{ gridTemplateColumns: `repeat(${boardSize}, 1fr)` }}
          >
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
