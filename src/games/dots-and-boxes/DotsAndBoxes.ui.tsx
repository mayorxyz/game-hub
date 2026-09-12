import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import {
  DotsAndBoxesState,
  GRID_SIZE,
  createInitialState,
  getWinner,
  getBotMove,
  placeHorizontalLine,
  placeVerticalLine,
} from './DotsAndBoxes';
import {
  handleHorizontalLineClick,
  handleVerticalLineClick,
} from './DotsAndBoxes.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';
import DifficultySelector from '../../components/ui/DifficultySelector';

const DOT_SIZE = 12;
const LINE_SPACING = 60;

export default function DotsAndBoxes() {
  const { difficulty, setDifficulty } = useDifficulty();
  const gridSize = Math.max(4, applyDifficulty(GRID_SIZE, getDifficultySettings(difficulty), 'size'));
  // Keep larger boards inside a phone screen.
  const spacing = gridSize > 5 ? 44 : LINE_SPACING;

  const [gameState, setGameState] = useState<DotsAndBoxesState>(() => loadSavedState<DotsAndBoxesState>('dots-and-boxes', d => d as DotsAndBoxesState) ?? createInitialState(gridSize));
  const [vsBot, setVsBot] = useState(true);
  const { record } = useGameResult('dots-and-boxes');
  useGameStatePersistence("dots-and-boxes", gameState, s => s, s => !s.isGameOver);
  const play = useSound();

  const handleReset = () => {
    clearSavedState('dots-and-boxes');
    setGameState(createInitialState(gridSize));
  };

  // Player 2 is played by a simple bot in single-player mode.
  useEffect(() => {
    if (!vsBot || gameState.isGameOver || gameState.currentPlayer !== 2) return;
    const id = setTimeout(() => {
      setGameState(prev => {
        if (prev.currentPlayer !== 2 || prev.isGameOver) return prev;
        const move = getBotMove(prev);
        if (!move) return prev;
        return move.type === 'horizontal'
          ? placeHorizontalLine(prev, move.row, move.col)
          : placeVerticalLine(prev, move.row, move.col);
      });
    }, 450);
    return () => clearTimeout(id);
  }, [vsBot, gameState.currentPlayer, gameState.isGameOver]);

  const winner = getWinner(gameState);

  useEffect(() => {
    if (gameState.isGameOver) {
      const w = getWinner(gameState);
      record({ won: w === 1, score: gameState.player1Score });
    }
  }, [gameState.isGameOver]);

  const handleHorizontalClick = (row: number, col: number) => {
    play('click');
    handleHorizontalLineClick(gameState, row, col, setGameState);
  };

  const handleVerticalClick = (row: number, col: number) => {
    handleVerticalLineClick(gameState, row, col, setGameState);
  };

  return (
    <GameLayout
      title="Dots and Boxes"
      score={`P1: ${gameState.player1Score} | P2: ${gameState.player2Score}`}
      onReset={handleReset}
    >
      <div className="flex flex-col items-center gap-4 p-4">
        {/* Mode toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setVsBot(true); setGameState(createInitialState(gridSize)); }}
            className={`px-3 py-1 rounded-lg text-sm font-bold ${vsBot ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            vs Bot
          </button>
          <button
            onClick={() => { setVsBot(false); setGameState(createInitialState(gridSize)); }}
            className={`px-3 py-1 rounded-lg text-sm font-bold ${!vsBot ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-300'}`}
          >
            2 Players
          </button>
        </div>

        {/* Difficulty Selector */}
        <DifficultySelector
          value={difficulty}
          onChange={(newDifficulty) => {
            setDifficulty(newDifficulty);
            // Board size is baked into the state, so start a fresh game.
            const newGridSize = Math.max(4, applyDifficulty(GRID_SIZE, getDifficultySettings(newDifficulty), 'size'));
            setGameState(createInitialState(newGridSize));
          }}
        />

        {/* Current player indicator */}
        {!gameState.isGameOver && (
          <div className="text-lg font-bold">
            {vsBot && gameState.currentPlayer === 2 ? 'Bot' : `Player ${gameState.currentPlayer}`}'s Turn
            <span className={`ml-2 inline-block w-4 h-4 rounded-full ${
              gameState.currentPlayer === 1 ? 'bg-blue-500' : 'bg-red-500'
            }`} />
          </div>
        )}

        {/* Game board */}
        <div
          className="relative bg-gray-900 rounded-lg p-8"
          style={{
            width: (gridSize - 1) * spacing + DOT_SIZE,
            height: (gridSize - 1) * spacing + DOT_SIZE,
          }}
        >
          {/* Render dots */}
          {Array.from({ length: gridSize }).map((_, row) =>
            Array.from({ length: gridSize }).map((_, col) => (
              <div
                key={`dot-${row}-${col}`}
                className="absolute w-3 h-3 bg-white rounded-full"
                style={{
                  left: col * spacing,
                  top: row * spacing,
                }}
              />
            ))
          )}

          {/* Render horizontal lines */}
          {Array.from({ length: gridSize }).map((_, row) =>
            Array.from({ length: gridSize - 1 }).map((_, col) => {
              const isPlaced = gameState.horizontalLines[row][col];
              return (
                <button
                  key={`h-${row}-${col}`}
                  onClick={() => handleHorizontalClick(row, col)}
                  disabled={isPlaced || gameState.isGameOver || (vsBot && gameState.currentPlayer === 2)}
                  className={`absolute h-1 transition-colors ${
                    isPlaced
                      ? gameState.currentPlayer === 1
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                      : 'bg-gray-600 hover:bg-gray-400'
                  } ${isPlaced || gameState.isGameOver ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    left: col * spacing + DOT_SIZE / 2,
                    top: row * spacing + DOT_SIZE / 2 - 2,
                    width: spacing - DOT_SIZE,
                  }}
                />
              );
            })
          )}

          {/* Render vertical lines */}
          {Array.from({ length: gridSize - 1 }).map((_, row) =>
            Array.from({ length: gridSize }).map((_, col) => {
              const isPlaced = gameState.verticalLines[row][col];
              return (
                <button
                  key={`v-${row}-${col}`}
                  onClick={() => handleVerticalClick(row, col)}
                  disabled={isPlaced || gameState.isGameOver || (vsBot && gameState.currentPlayer === 2)}
                  className={`absolute w-1 transition-colors ${
                    isPlaced
                      ? gameState.currentPlayer === 1
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                      : 'bg-gray-600 hover:bg-gray-400'
                  } ${isPlaced || gameState.isGameOver ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    left: col * spacing + DOT_SIZE / 2 - 2,
                    top: row * spacing + DOT_SIZE / 2,
                    height: spacing - DOT_SIZE,
                  }}
                />
              );
            })
          )}

          {/* Render completed boxes */}
          {Array.from({ length: gridSize - 1 }).map((_, row) =>
            Array.from({ length: gridSize - 1 }).map((_, col) => {
              const boxOwner = gameState.boxes[row][col];
              if (boxOwner === null) return null;
              return (
                <div
                  key={`box-${row}-${col}`}
                  className={`absolute rounded opacity-30 ${
                    boxOwner === 1 ? 'bg-blue-500' : 'bg-red-500'
                  }`}
                  style={{
                    left: col * spacing + DOT_SIZE / 2,
                    top: row * spacing + DOT_SIZE / 2,
                    width: spacing - DOT_SIZE,
                    height: spacing - DOT_SIZE,
                  }}
                />
              );
            })
          )}
        </div>

        {/* Game over overlay */}
        {gameState.isGameOver && (
          <div className="text-center">
            <div className="text-2xl font-bold mb-2">
              {winner === 'tie' ? "It's a Tie!" : vsBot && winner === 2 ? 'Bot Wins!' : `Player ${winner} Wins!`}
            </div>
            <div className="text-lg text-gray-400 mb-4">
              Final Score: P1 {gameState.player1Score} - P2 {gameState.player2Score}
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
