import React, { useState, useEffect } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';

const EMOJIS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎸', '🎺'];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function createCards(): Card[] {
  return [...EMOJIS, ...EMOJIS]
    .sort(() => Math.random() - 0.5)
    .map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
}

export default function MemoryMatch() {
  const [cards, setCards] = useState<Card[]>(createCards);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  // For Memory Match, lower moves is better. Store as inverted value for consistency.
  const storedBest = getHighScore('memory-match');
  const [bestMoves, setBestMoves] = useState<number>(storedBest > 0 ? 10000 - storedBest : Infinity);

  useEffect(() => {
    if (selected.length === 2) {
      const [a, b] = selected;
      if (cards[a].emoji === cards[b].emoji) {
        setCards(prev => prev.map((c, i) => i === a || i === b ? { ...c, matched: true } : c));
        setSelected([]);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 800);
      }
      setMoves(m => m + 1);
    }
  }, [selected, cards]);

  const handleClick = (idx: number) => {
    if (selected.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, flipped: true } : c));
    setSelected(prev => [...prev, idx]);
  };

  const reset = () => {
    setCards(createCards());
    setSelected([]);
    setMoves(0);
  };

  const allMatched = cards.every(c => c.matched);

  // Update best moves when game is won
  useEffect(() => {
    if (allMatched && moves > 0) {
      if (moves < bestMoves) {
        setBestMoves(moves);
        // Store inverted value for consistency with high score system
        setHighScore('memory-match', 10000 - moves);
      }
    }
  }, [allMatched, moves, bestMoves]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Memory Match</h1>
      <div className="mb-4 flex gap-6">
        <p>Moves: {moves}</p>
        {bestMoves !== Infinity && <p>Best: {bestMoves}</p>}
      </div>
      {allMatched && (
        <div className="mb-4 text-center">
          <p className="text-green-400 text-xl font-bold mb-2">🎉 You Win!</p>
          <button onClick={reset} className="px-6 py-3 bg-blue-600 rounded-lg">
            Play Again
          </button>
        </div>
      )}
      {!allMatched && (
        <button onClick={reset} className="px-6 py-3 bg-blue-600 rounded-lg mb-4">
          Reset
        </button>
      )}
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, i) => (
          <button
            key={card.id}
            onClick={() => handleClick(i)}
            className={`w-16 h-16 rounded-lg text-2xl flex items-center justify-center transition-all ${
              card.matched
                ? 'bg-green-600'
                : card.flipped
                ? 'bg-gray-700'
                : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            {(card.flipped || card.matched) ? card.emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}
