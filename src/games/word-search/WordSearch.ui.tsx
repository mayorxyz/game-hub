import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import {
  WORDS,
  GRID_SIZE,
  WordSearchState,
  createInitialState,
} from './WordSearch';
import { handleWordClick } from './WordSearch.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty, type Difficulty } from '../../lib/difficulty';
import DifficultySelector from '../../components/ui/DifficultySelector';

export default function WordSearch({ daily = false, dailySeed }: { daily?: boolean; dailySeed?: number }) {
  const { difficulty, setDifficulty } = useDifficulty();

  const makeState = (d: Difficulty) => createInitialState(
    daily ? dailySeed : undefined,
    Math.max(6, applyDifficulty(GRID_SIZE, getDifficultySettings(d), 'size')),
    Math.max(4, Math.min(WORDS.length, applyDifficulty(WORDS.length, getDifficultySettings(d), 'complexity')))
  );

  const [gameState, setGameState] = useState<WordSearchState>(() => {
    const saved = loadSavedState<WordSearchState>('word-search', d => {
      const raw = d as Omit<WordSearchState, 'positions' | 'found'> & { positions: [string, [number, number][]][]; found: string[] };
      return { ...raw, positions: new Map(raw.positions ?? []), found: new Set(raw.found ?? []) };
    });
    return saved ?? makeState(difficulty);
  });
  // The stored grid is clamped to the longest hidden word, so read the real size back.
  const gridSize = gameState.grid.length;
  const [highScore, setHighScoreState] = useState(getHighScore('word-search'));
  const { record } = useGameResult('word-search', { daily });
  useGameStatePersistence('word-search', gameState, s => ({ ...s, positions: Array.from(s.positions.entries()), found: Array.from(s.found) }), s => !s.isWon);
  const play = useSound();

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
    play('click');
    handleWordClick(gameState, word, onStateChange);
  };

  useEffect(() => {
    if (gameState.isWon) {
      record({ won: true, score: 1000 });
    }
  }, [gameState.isWon]);

  const onReset = () => {
    clearSavedState('word-search');
    setGameState(makeState(difficulty));
  };

  return (
    <GameLayout
      title="Word Search"
      score={`${gameState.found.size}/${gameState.words.length}`}
      highScore={highScore}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        {gameState.isWon && <p className="text-green-400 text-xl font-bold">🎉 All words found!</p>}

        {/* Difficulty Selector */}
        <DifficultySelector
          value={difficulty}
          onChange={(newDifficulty) => {
            setDifficulty(newDifficulty);
            // Grid size and word count are baked into the state; the daily seed keeps the layout deterministic.
            setGameState(makeState(newDifficulty));
          }}
        />
        
        {/* Responsive Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div
            className="absolute inset-0 grid gap-0 bg-gray-800 p-2 rounded-lg overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
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
          {gameState.words.map(word => (
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
