import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import {
  WORD_LEN,
  MAX_GUESSES,
  WordleState,
  LetterState,
  createInitialState,
  resetGame,
  getRows,
  getLetterState,
} from './Wordle';
import { handleLetterInput, handleBackspace, handleSubmit } from './Wordle.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings } from '../../lib/difficulty';

export default function Wordle({ daily = false, dailySeed }: { daily?: boolean; dailySeed?: number }) {
  const { difficulty } = useDifficulty();
  // Fewer allowed guesses on harder settings (inverse of the complexity multiplier).
  const maxGuesses = Math.max(3, Math.round(MAX_GUESSES / getDifficultySettings(difficulty).complexityMultiplier));

  const [gameState, setGameState] = useState<WordleState>(() => (!daily ? loadSavedState<WordleState>('wordle', d => d as WordleState) : null) ?? createInitialState(daily ? dailySeed : undefined));
  const [highScore, setHighScoreState] = useState(getHighScore('wordle'));
  const { record } = useGameResult('wordle', { daily });
  useGameStatePersistence("wordle", gameState, s => s, s => !s.isGameOver);
  const play = useSound();

  const onStateChange = (newState: WordleState) => {
    setGameState(newState);
    if (newState.isWon) {
      const score = maxGuesses - newState.guesses.length + 1;
      setHighScoreState(prev => {
        const best = Math.max(prev, score * 100);
        setHighScore('wordle', best);
        return best;
      });
    }
  };

  const onLetterInput = (letter: string) => {
    play('click');
    handleLetterInput(gameState, letter, onStateChange);
  };

  const onBackspace = () => {
    handleBackspace(gameState, onStateChange);
  };

  const onSubmit = () => {
    play('move');
    handleSubmit(gameState, onStateChange, maxGuesses);
  };

  useEffect(() => {
    if (gameState.isGameOver) {
      record({
        won: gameState.isWon,
        score: gameState.isWon ? (maxGuesses - gameState.guesses.length + 1) * 100 : 0,
      });
    }
  }, [gameState.isGameOver]);

  const onReset = () => {
    clearSavedState('wordle');
    setGameState(resetGame(daily ? dailySeed : undefined));
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameState.isGameOver) return;
      if (e.key === 'Backspace') e.preventDefault();
      if (e.key === 'Enter') onSubmit();
      else if (e.key === 'Backspace') onBackspace();
      else if (/^[a-zA-Z]$/.test(e.key) && gameState.currentGuess.length < WORD_LEN) {
        onLetterInput(e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [gameState]);

  const rows = getRows(gameState, maxGuesses);

  const stateColors: Record<LetterState, string> = {
    correct: 'bg-green-600 border-green-600',
    present: 'bg-yellow-600 border-yellow-600',
    absent: 'bg-gray-700 border-gray-700',
    empty: 'bg-gray-800 border-gray-600',
  };

  return (
    <GameLayout
      title="Wordle"
      showDifficulty
      score={gameState.isWon ? `${maxGuesses - gameState.guesses.length + 1}/${maxGuesses}` : undefined}
      highScore={highScore}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        {gameState.isWon && <p className="text-green-400 text-xl font-bold">🎉 Got it in {gameState.guesses.length}!</p>}
        {gameState.isGameOver && !gameState.isWon && <p className="text-red-400 text-xl font-bold">The word was: {gameState.target}</p>}

        <div className="flex flex-col gap-1">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.letters.map((l, ci) => (
                <div
                  key={ci}
                  className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-xl sm:text-2xl font-bold rounded ${stateColors[row.states[ci]]}`}
                >
                  {l}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-1 max-w-sm">
          {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, ri) => (
            <div key={ri} className="flex gap-1 mb-1">
              {row.split('').map(letter => {
                const state = getLetterState(gameState, letter);
                return (
                  <button
                    key={letter}
                    onClick={() => onLetterInput(letter)}
                    className={`min-w-[48px] min-h-[48px] rounded text-xs sm:text-sm font-bold ${
                      state === 'correct'
                        ? 'bg-green-600'
                        : state === 'present'
                        ? 'bg-yellow-600'
                        : state === 'absent'
                        ? 'bg-gray-700'
                        : 'bg-gray-600 hover:bg-gray-500 active:bg-gray-400'
                    } text-white`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}
          <button
            onClick={onSubmit}
            className="min-w-[48px] min-h-[48px] px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded text-sm font-bold text-white"
            style={{ touchAction: 'manipulation' }}
          >
            ⏎
          </button>
          <button
            onClick={onBackspace}
            className="min-w-[48px] min-h-[48px] px-3 bg-gray-600 hover:bg-gray-500 active:bg-gray-400 rounded text-sm font-bold text-white"
            style={{ touchAction: 'manipulation' }}
          >
            ⌫
          </button>
        </div>
      </div>
    </GameLayout>
  );
}
