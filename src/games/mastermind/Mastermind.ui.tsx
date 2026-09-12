import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import { getHighScore } from '../../lib/persistence';
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
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';

export default function Mastermind() {
  const { difficulty } = useDifficulty();
  const difficultySettings = getDifficultySettings(difficulty);
  // Longer codes and fewer attempts on harder settings.
  const codeLength = Math.min(5, Math.max(3, applyDifficulty(CODE_LENGTH, difficultySettings, 'complexity')));
  const maxAttempts = Math.max(6, Math.round(MAX_ATTEMPTS / difficultySettings.complexityMultiplier));
  const scoreMultiplier = difficultySettings.scoreMultiplier;

  const [gameState, setGameState] = useState<MastermindState>(() => loadSavedState<MastermindState>('mastermind', d => d as MastermindState) ?? createInitialState(codeLength));
  const { record } = useGameResult('mastermind');
  useGameStatePersistence("mastermind", gameState, s => s, s => !s.isGameOver);
  const play = useSound();
  const [highScore, setHighScoreState] = useState(getHighScore('mastermind'));

  const handleReset = () => {
    clearSavedState('mastermind');
    setGameState(createInitialState(codeLength));
  };

  useEffect(() => {
    if (gameState.isGameOver) {
      const score = gameState.isWon ? Math.round((maxAttempts - gameState.guesses.length + 1) * 100 * scoreMultiplier) : 0;
      record({ won: gameState.isWon, score });
      if (gameState.isWon) setHighScoreState(prev => Math.max(prev, score));
    }
  }, [gameState.isGameOver, maxAttempts, scoreMultiplier]);

  const onColorSelect = (color: Color) => {
    play('click');
    handleColorSelect(gameState, color, setGameState);
  };

  const onUndo = () => {
    handleUndo(gameState, setGameState);
  };

  const onSubmit = () => {
    handleSubmit(gameState, setGameState, maxAttempts);
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
      showDifficulty
      score={`Attempt ${gameState.guesses.length + 1}/${maxAttempts}`}
      highScore={highScore}
  onReset={handleReset}
    >
      <div className="flex flex-col items-center gap-4 p-4">
        {/* Secret code (hidden) */}
        <div className="flex gap-2 mb-4">
          {Array.from({ length: gameState.secretCode.length }).map((_, i) => (
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
          {Array.from({ length: gameState.secretCode.length }).map((_, i) => (
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
              disabled={gameState.isGameOver || gameState.currentGuess.length >= gameState.secretCode.length}
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
            disabled={gameState.isGameOver || gameState.currentGuess.length !== gameState.secretCode.length}
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
