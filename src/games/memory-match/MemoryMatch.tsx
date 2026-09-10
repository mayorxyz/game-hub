import React, { useState, useEffect } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';
import GameLayout from '../../components/ui/GameLayout';

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
    setBestMoves(storedBest > 0 ? 10000 - storedBest : Infinity);
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
    <GameLayout title="Memory Match" score={`${moves} moves`} highScore={bestMoves !== Infinity ? bestMoves : undefined} onReset={reset}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {allMatched && <p className="text-green-400 text-xl font-bold">🎉 You Win!</p>}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid grid-cols-4 gap-2">
            {cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => handleClick(i)}
                className={`rounded-lg text-2xl flex items-center justify-center transition-all min-h-[48px] min-w-[48px] ${
                  card.matched
                    ? 'bg-green-600'
                    : card.flipped
                    ? 'bg-gray-700'
                    : 'bg-purple-600 hover:bg-purple-500 active:bg-purple-500'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {(card.flipped || card.matched) ? card.emoji : '?'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameLayout>
  );
}
