import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  WORDS,
  WordSearchState,
  createInitialState,
  resetGame,
} from './WordSearch';
import { handleWordClick } from './WordSearch.controls';

export default function WordSearch() {
  const [gameState, setGameState] = useState<WordSearchState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('word-search'));

  const onStateChange = (newState: WordSearchState) => {
    setGameState(newState);
    if (newState.isWon) {
      setHighScoreState(prev => {
        const best = Math.max(prev, 1000);
        setHighScore('word-search', best);
        return best;
      });
    }
  };

  const onWordClick = (word: string) => {
    handleWordClick(gameState, word, onStateChange);
  };

  const onReset = () => {
    setGameState(resetGame());
  };

  return (
    <GameLayout
      title="Word Search"
      score={`${gameState.found.size}/${WORDS.length}`}
      highScore={highScore}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        {gameState.isWon && <p className="text-green-400 text-xl font-bold">🎉 All words found!</p>}
        
        {/* Responsive Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div
            className="absolute inset-0 grid gap-0 bg-gray-800 p-2 rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(10, 1fr)`,
              gridTemplateRows: `repeat(10, 1fr)`,
            }}
          >
            {gameState.grid.flat().map((ch, i) => (
              <div key={i} className="flex items-center justify-center text-xs sm:text-sm font-mono font-bold text-gray-300">
                {ch}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
          {WORDS.map(word => (
            <button
              key={word}
              onClick={() => onWordClick(word)}
              className={`min-h-[48px] px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                gameState.found.has(word)
                  ? 'bg-green-600 text-white line-through'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 active:bg-gray-500'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {word}
            </button>
          ))}
        </div>
        <p className="text-gray-500 text-xs">Click words to mark them found</p>
      </div>
    </GameLayout>
  );
}
