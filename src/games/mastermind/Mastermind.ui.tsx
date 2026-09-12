import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import {
  MastermindState,
  COLORS,
  Color,
  CODE_LENGTH,
  MAX_ATTEMPTS,
  createInitialState,
} from './Mastermind';
import {
  handleColorSelect,
  handleUndo,
  handleSubmit,
  handleClear,
} from './Mastermind.controls';

export default function Mastermind() {
  const [gameState, setGameState] = useState<MastermindState>(createInitialState());

  const handleReset = () => {
    setGameState(createInitialState());
  };

  const onColorSelect = (color: Color) => {
    handleColorSelect(gameState, color, setGameState);
  };

  const onUndo = () => {
    handleUndo(gameState, setGameState);
  };

  const onSubmit = () => {
    handleSubmit(gameState, setGameState);
  };

  const onClear = () => {
    handleClear(gameState, setGameState);
  };

  const getColorClass = (color: Color) => {
    const classes: Record<Color, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
    };
    return classes[color];
  };

  return (
    <GameLayout
      title="Mastermind"
      score={`Attempt ${gameState.guesses.length + 1}/${MAX_ATTEMPTS}`}
      onReset={handleReset}
    >
      <div className="flex flex-col items-center gap-4 p-4">
        {/* Secret code (hidden) */}
        <div className="flex gap-2 mb-4">
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center text-2xl"
            >
              ?
            </div>
          ))}
        </div>

        {/* Previous guesses */}
        <div className="w-full max-w-md space-y-2 mb-4">
          {gameState.guesses.map((guess, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-gray-800 p-3 rounded-lg">
              <div className="flex gap-1">
                {guess.code.map((color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded ${getColorClass(color)}`}
                  />
                ))}
              </div>
              <div className="flex gap-1 ml-auto">
                {Array.from({ length: guess.blackPegs }).map((_, i) => (
                  <div key={`b-${i}`} className="w-4 h-4 bg-black rounded-full border border-gray-600" />
                ))}
                {Array.from({ length: guess.whitePegs }).map((_, i) => (
                  <div key={`w-${i}`} className="w-4 h-4 bg-white rounded-full border border-gray-600" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Current guess */}
        <div className="flex gap-2 mb-4">
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-12 rounded-lg border-2 border-gray-600 flex items-center justify-center ${
                gameState.currentGuess[i] ? getColorClass(gameState.currentGuess[i]) : 'bg-gray-800'
              }`}
            />
          ))}
        </div>

        {/* Color picker */}
        <div className="flex gap-2 mb-4">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => onColorSelect(color)}
              disabled={gameState.isGameOver || gameState.currentGuess.length >= CODE_LENGTH}
              className={`w-12 h-12 rounded-lg ${getColorClass(color)} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={gameState.isGameOver || gameState.currentGuess.length === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            Undo
          </button>
          <button
            onClick={onClear}
            disabled={gameState.isGameOver || gameState.currentGuess.length === 0}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            Clear
          </button>
          <button
            onClick={onSubmit}
            disabled={gameState.isGameOver || gameState.currentGuess.length !== CODE_LENGTH}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
          >
            Submit
          </button>
        </div>

        {/* Game over */}
        {gameState.isGameOver && (
          <div className="text-center mt-4">
            {gameState.isWon ? (
              <div className="text-green-400 text-xl font-bold">You Win!</div>
            ) : (
              <div className="text-red-400 text-xl font-bold">Game Over!</div>
            )}
            <div className="mt-2 text-gray-400">
              The code was:{' '}
              <span className="flex gap-1 inline-flex">
                {gameState.secretCode.map((color, i) => (
                  <div key={i} className={`w-6 h-6 rounded ${getColorClass(color)}`} />
                ))}
              </span>
            </div>
          </div>
        )}
      </div>
    </GameLayout>
  );
}
