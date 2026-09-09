import React, { useState, useEffect } from 'react';
const EMOJIS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎸', '🎺'];
export default function MemoryMatch() {
  const [cards, setCards] = useState(() => [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })));
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  useEffect(() => {
    if (selected.length === 2) {
      const [a, b] = selected;
      if (cards[a].emoji === cards[b].emoji) {
        setCards(prev => prev.map((c, i) => i === a || i === b ? { ...c, matched: true } : c));
        setSelected([]);
      } else {
        setTimeout(() => { setCards(prev => prev.map((c, i) => i === a || i === b ? { ...c, flipped: false } : c)); setSelected([]); }, 800);
      }
      setMoves(m => m + 1);
    }
  }, [selected]);
  const handleClick = (idx: number) => {
    if (selected.length >= 2 || cards[idx].flipped || cards[idx].matched) return;
    setCards(prev => prev.map((c, i) => i === idx ? { ...c, flipped: true } : c));
    setSelected(prev => [...prev, idx]);
  };
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-4">Memory Match</h1>
      <p className="mb-4">Moves: {moves}</p>
      <div className="grid grid-cols-4 gap-2">
        {cards.map((card, i) => (
          <button key={card.id} onClick={() => handleClick(i)} className={`w-16 h-16 rounded-lg text-2xl flex items-center justify-center ${card.flipped || card.matched ? 'bg-gray-700' : 'bg-purple-600'}`}>
            {(card.flipped || card.matched) ? card.emoji : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}
