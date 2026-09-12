import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import {
  DotsAndBoxesState,
  GRID_SIZE,
  createInitialState,
  getWinner,
} from './DotsAndBoxes';
import {
  handleHorizontalLineClick,
  handleVerticalLineClick,
} from './DotsAndBoxes.controls';

const DOT_SIZE = 12;
const LINE_SPACING = 60;

export default function DotsAndBoxes() {
  const [gameState, setGameState] = useState<DotsAndBoxesState>(createInitialState());

  const handleReset = () => {
    setGameState(createInitialState());
  };

  const winner = getWinner(gameState);

  const handleHorizontalClick = (row: number, col: number) => {
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
        {/* Current player indicator */}
        {!gameState.isGameOver && (
          <div className="text-lg font-bold">
            Player {gameState.currentPlayer}'s Turn
            <span className={`ml-2 inline-block w-4 h-4 rounded-full ${
              gameState.currentPlayer === 1 ? 'bg-blue-500' : 'bg-red-500'
            }`} />
          </div>
        )}

        {/* Game board */}
        <div
          className="relative bg-gray-900 rounded-lg p-8"
          style={{
            width: (GRID_SIZE - 1) * LINE_SPACING + DOT_SIZE,
            height: (GRID_SIZE - 1) * LINE_SPACING + DOT_SIZE,
          }}
        >
          {/* Render dots */}
          {Array.from({ length: GRID_SIZE }).map((_, row) =>
            Array.from({ length: GRID_SIZE }).map((_, col) => (
              <div
                key={`dot-${row}-${col}`}
                className="absolute w-3 h-3 bg-white rounded-full"
                style={{
                  left: col * LINE_SPACING,
                  top: row * LINE_SPACING,
                }}
              />
            ))
          )}

          {/* Render horizontal lines */}
          {Array.from({ length: GRID_SIZE }).map((_, row) =>
            Array.from({ length: GRID_SIZE - 1 }).map((_, col) => {
              const isPlaced = gameState.horizontalLines[row][col];
              return (
                <button
                  key={`h-${row}-${col}`}
                  onClick={() => handleHorizontalClick(row, col)}
                  disabled={isPlaced || gameState.isGameOver}
                  className={`absolute h-1 transition-colors ${
                    isPlaced
                      ? gameState.currentPlayer === 1
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                      : 'bg-gray-600 hover:bg-gray-400'
                  } ${isPlaced || gameState.isGameOver ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    left: col * LINE_SPACING + DOT_SIZE / 2,
                    top: row * LINE_SPACING + DOT_SIZE / 2 - 2,
                    width: LINE_SPACING - DOT_SIZE,
                  }}
                />
              );
            })
          )}

          {/* Render vertical lines */}
          {Array.from({ length: GRID_SIZE - 1 }).map((_, row) =>
            Array.from({ length: GRID_SIZE }).map((_, col) => {
              const isPlaced = gameState.verticalLines[row][col];
              return (
                <button
                  key={`v-${row}-${col}`}
                  onClick={() => handleVerticalClick(row, col)}
                  disabled={isPlaced || gameState.isGameOver}
                  className={`absolute w-1 transition-colors ${
                    isPlaced
                      ? gameState.currentPlayer === 1
                        ? 'bg-blue-500'
                        : 'bg-red-500'
                      : 'bg-gray-600 hover:bg-gray-400'
                  } ${isPlaced || gameState.isGameOver ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                  style={{
                    left: col * LINE_SPACING + DOT_SIZE / 2 - 2,
                    top: row * LINE_SPACING + DOT_SIZE / 2,
                    height: LINE_SPACING - DOT_SIZE,
                  }}
                />
              );
            })
          )}

          {/* Render completed boxes */}
          {Array.from({ length: GRID_SIZE - 1 }).map((_, row) =>
            Array.from({ length: GRID_SIZE - 1 }).map((_, col) => {
              const boxOwner = gameState.boxes[row][col];
              if (boxOwner === null) return null;
              return (
                <div
                  key={`box-${row}-${col}`}
                  className={`absolute rounded opacity-30 ${
                    boxOwner === 1 ? 'bg-blue-500' : 'bg-red-500'
                  }`}
                  style={{
                    left: col * LINE_SPACING + DOT_SIZE / 2,
                    top: row * LINE_SPACING + DOT_SIZE / 2,
                    width: LINE_SPACING - DOT_SIZE,
                    height: LINE_SPACING - DOT_SIZE,
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
              {winner === 'tie' ? "It's a Tie!" : `Player ${winner} Wins!`}
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
