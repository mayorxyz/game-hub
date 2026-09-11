import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  HangmanState,
  createInitialState,
  resetGame,
  getDisplayWord,
} from './Hangman';
import { handleLetterGuess } from './Hangman.controls';

export default function Hangman() {
  const [gameState, setGameState] = useState<HangmanState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('hangman'));

  const onGuess = (newState: HangmanState) => {
    setGameState(newState);
    if (newState.isWon) {
      setHighScoreState(prev => {
        const best = Math.max(prev, newState.streak);
        setHighScore('hangman', best);
        return best;
      });
    }
  };

  const onLetterClick = (letter: string) => {
    handleLetterGuess(gameState, letter, onGuess);
  };

  const onReset = () => {
    setGameState(resetGame(gameState));
  };

  return (
    <GameLayout
      title="Hangman"
      score={`Streak: ${gameState.streak}`}
      highScore={highScore}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        <div className="text-4xl sm:text-5xl h-16 flex items-center justify-center">
          {gameState.wrongGuesses >= 1 && '😵'}
          {gameState.wrongGuesses === 0 && '😊'}
        </div>

        <div className="flex gap-1 sm:gap-2 text-xl sm:text-2xl font-mono">
          {gameState.word.split('').map((l, i) => (
            <span
              key={i}
              className={`w-7 h-9 sm:w-9 sm:h-11 border-b-2 flex items-center justify-center font-bold ${
                gameState.guessedLetters.has(l) || gameState.isLost ? 'text-white' : 'text-transparent'
              }`}
            >
              {gameState.guessedLetters.has(l) || gameState.isLost ? l : '_'}
            </span>
          ))}
        </div>

        {gameState.isWon && <p className="text-green-400 text-xl font-bold">🎉 You got it!</p>}
        {gameState.isLost && <p className="text-red-400 text-xl font-bold">💀 The word was: {gameState.word}</p>}

        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-md">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <button
              key={letter}
              onClick={() => onLetterClick(letter)}
              disabled={gameState.guessedLetters.has(letter) || gameState.isWon || gameState.isLost}
              className={`min-w-[48px] min-h-[48px] rounded-lg text-xs sm:text-sm font-bold transition-all ${
                gameState.guessedLetters.has(letter)
                  ? gameState.word.includes(letter)
                    ? 'bg-green-600 text-white'
                    : 'bg-red-600/50 text-gray-400'
                  : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white'
              } disabled:cursor-not-allowed`}
              style={{ touchAction: 'manipulation' }}
            >
              {letter}
            </button>
          ))}
        </div>

        <p className="text-gray-500 text-xs">{6 - gameState.wrongGuesses} guesses remaining</p>
      </div>
    </GameLayout>
  );
}
