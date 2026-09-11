import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  TypingGameState,
  startGame,
  calculateAccuracy,
  resetGame,
} from './TypingGame';
import { handleInputChange } from './TypingGame.controls';

export default function TypingGame() {
  const [gameState, setGameState] = useState<TypingGameState>(resetGame());
  const [highScore, setHighScoreState] = useState(getHighScore('typing-game'));
  const inputRef = useRef<HTMLInputElement>(null);

  const onStateChange = (newState: TypingGameState) => {
    setGameState(newState);
    if (newState.isFinished) {
      setHighScoreState(prev => {
        const best = Math.max(prev, newState.wpm);
        setHighScore('typing-game', best);
        return best;
      });
    }
  };

  const onStart = () => {
    const newState = startGame(gameState);
    setGameState(newState);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChange(gameState, e.target.value, onStateChange);
  };

  const onReset = () => {
    setGameState(resetGame());
  };

  const accuracy = calculateAccuracy(gameState.input, gameState.text);

  return (
    <GameLayout
      title="Typing Game"
      score={gameState.isFinished ? `${gameState.wpm} WPM` : gameState.isStarted ? `${gameState.wpm} WPM` : undefined}
      highScore={highScore}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-between w-full h-full gap-4 max-w-lg mx-auto">
        {!gameState.isStarted && (
          <button
            onClick={onStart}
            className="min-h-[48px] px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg font-bold"
            style={{ touchAction: 'manipulation' }}
          >
            Start Typing
          </button>
        )}
        {gameState.isFinished && (
          <p className="text-green-400 text-xl font-bold">🎉 {gameState.wpm} WPM · {accuracy}% accuracy</p>
        )}

        {gameState.isStarted && (
          <>
            <div className="bg-gray-800 p-4 rounded-xl w-full text-sm sm:text-base font-mono leading-relaxed overflow-auto">
              {gameState.text.split('').map((ch, i) => (
                <span
                  key={i}
                  className={
                    i < gameState.input.length
                      ? gameState.input[i] === ch
                        ? 'text-green-400'
                        : 'text-red-400 bg-red-900/30'
                      : i === gameState.input.length
                      ? 'text-white bg-gray-600'
                      : 'text-gray-500'
                  }
                >
                  {ch}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              value={gameState.input}
              onChange={onInputChange}
              disabled={gameState.isFinished}
              className="w-full min-h-[48px] bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-purple-500"
              placeholder="Start typing..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{ touchAction: 'manipulation' }}
            />
            <div className="flex gap-4 text-sm text-gray-400">
              <span>
                WPM: <span className="text-white font-bold">{gameState.wpm}</span>
              </span>
              <span>
                Accuracy: <span className="text-white font-bold">{accuracy}%</span>
              </span>
            </div>
          </>
        )}
      </div>
    </GameLayout>
  );
}
