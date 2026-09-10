import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

type Card = { suit: string; rank: number; color: string; id: number; faceUp: boolean };
const SUITS = ['♠', '♥', '♦', '♣'];

function createDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  for (const suit of SUITS) {
    const color = suit === '♥' || suit === '♦' ? 'red' : 'black';
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ suit, rank, color, id: id++, faceUp: false });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

const RANK_NAMES: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };

function initializeGame(): { stock: Card[]; tableau: Card[][] } {
  const deck = createDeck().map(c => ({ ...c, faceUp: false }));
  const tabs: Card[][] = [[], [], [], [], [], [], []];
  let di = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[di], faceUp: row === col };
      tabs[col].push(card);
      di++;
    }
  }
  return {
    stock: deck.slice(di).map(c => ({ ...c, faceUp: false })),
    tableau: tabs,
  };
}

export default function Solitaire() {
  const initial = initializeGame();
  const [stock, setStock] = useState<Card[]>(initial.stock);
  const [waste, setWaste] = useState<Card[]>([]);
  const [foundations, setFoundations] = useState<Card[][]>([[], [], [], []]);
  const [tableau, setTableau] = useState<Card[][]>(initial.tableau);
  const [moves, setMoves] = useState(0);
  const [highScore, setHS] = useState(getHighScore('solitaire'));
  const [won, setWon] = useState(false);
  const [selected, setSelected] = useState<{ source: string; idx: number } | null>(null);

  const drawCard = () => {
    if (stock.length === 0) {
      setStock(waste.reverse().map(c => ({ ...c, faceUp: false })));
      setWaste([]);
    } else {
      const card = { ...stock[stock.length - 1], faceUp: true };
      setStock(prev => prev.slice(0, -1));
      setWaste(prev => [...prev, card]);
    }
    setMoves(m => m + 1);
  };

  const canPlaceOnFoundation = (card: Card, fIdx: number): boolean => {
    const found = foundations[fIdx];
    if (found.length === 0) return card.rank === 1;
    const top = found[found.length - 1];
    return card.suit === top.suit && card.rank === top.rank + 1;
  };

  const canPlaceOnTableau = (card: Card, tIdx: number): boolean => {
    const tab = tableau[tIdx];
    if (tab.length === 0) return card.rank === 13;
    const top = tab[tab.length - 1];
    return top.faceUp && card.color !== top.color && card.rank === top.rank - 1;
  };

  const handleFoundationClick = (fIdx: number) => {
    if (!selected) return;
    let card: Card | null = null;
    if (selected.source === 'waste' && waste.length > 0) {
      card = waste[waste.length - 1];
    } else if (selected.source === 'tableau') {
      const tab = tableau[selected.idx];
      card = tab[tab.length - 1];
    }
    if (card && canPlaceOnFoundation(card, fIdx)) {
      const newFoundations = foundations.map((f, i) => i === fIdx ? [...f, card!] : [...f]);
      setFoundations(newFoundations);
      if (selected.source === 'waste') setWaste(prev => prev.slice(0, -1));
      else if (selected.source === 'tableau') {
        const newTab = tableau.map((t, i) => {
          if (i === selected.idx) {
            const nt = t.slice(0, -1);
            if (nt.length > 0 && !nt[nt.length - 1].faceUp) {
              nt[nt.length - 1] = { ...nt[nt.length - 1], faceUp: true };
            }
            return nt;
          }
          return t;
        });
        setTableau(newTab);
      }
      setSelected(null);
      setMoves(m => m + 1);
      if (newFoundations.every(f => f.length === 13)) {
        setWon(true);
        setHS(h => {
          const best = Math.max(h, 1000);
          setHighScore('solitaire', best);
          return best;
        });
      }
    } else {
      setSelected(null);
    }
  };

  const handleTableauClick = (tIdx: number) => {
    if (!selected) {
      const tab = tableau[tIdx];
      if (tab.length > 0 && tab[tab.length - 1].faceUp) {
        setSelected({ source: 'tableau', idx: tIdx });
      }
      return;
    }
    let card: Card | null = null;
    if (selected.source === 'waste' && waste.length > 0) card = waste[waste.length - 1];
    else if (selected.source === 'tableau') {
      const tab = tableau[selected.idx];
      card = tab[tab.length - 1];
    }
    if (card && canPlaceOnTableau(card, tIdx) && !(selected.source === 'tableau' && selected.idx === tIdx)) {
      const newTab = tableau.map((t, i) => {
        if (i === tIdx) return [...t, card!];
        if (selected.source === 'tableau' && i === selected.idx) {
          const nt = t.slice(0, -1);
          if (nt.length > 0 && !nt[nt.length - 1].faceUp) {
            return nt.map((c, ci) => ci === nt.length - 1 ? { ...c, faceUp: true } : c);
          }
          return nt;
        }
        return t;
      });
      setTableau(newTab);
      if (selected.source === 'waste') setWaste(prev => prev.slice(0, -1));
      setSelected(null);
      setMoves(m => m + 1);
    } else {
      setSelected(null);
    }
  };

  const handleWasteClick = () => {
    if (waste.length > 0) {
      setSelected({ source: 'waste', idx: 0 });
    }
  };

  const reset = () => {
    const initial = initializeGame();
    setStock(initial.stock);
    setWaste([]);
    setFoundations([[], [], [], []]);
    setTableau(initial.tableau);
    setMoves(0);
    setWon(false);
    setSelected(null);
  };

  const totalFound = foundations.reduce((sum, f) => sum + f.length, 0);

  return (
    <GameLayout title="Solitaire" score={`${totalFound}/52 · ${moves} moves`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center gap-4">
        {won && <p className="text-green-400 text-xl font-bold">🎉 You Win!</p>}
        <div className="flex gap-2 sm:gap-3 items-center">
          <button onClick={drawCard} className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg bg-blue-800 border-2 border-blue-600 flex items-center justify-center text-xl">
            {stock.length > 0 ? '🂠' : '↺'}
          </button>
          <button onClick={handleWasteClick} className={`w-12 h-16 sm:w-14 sm:h-20 rounded-lg border-2 flex items-center justify-center text-xs font-bold ${
            selected?.source === 'waste' ? 'border-yellow-400 bg-gray-700' : 'border-gray-600 bg-gray-800'
          }`}>
            {waste.length > 0 ? (
              <span className={waste[waste.length - 1].color === 'red' ? 'text-red-500' : 'text-white'}>
                {RANK_NAMES[waste[waste.length - 1].rank] || waste[waste.length - 1].rank}{waste[waste.length - 1].suit}
              </span>
            ) : ''}
          </button>
          <div className="w-2" />
          {foundations.map((f, i) => (
            <button
              key={i}
              onClick={() => handleFoundationClick(i)}
              className={`w-12 h-16 sm:w-14 sm:h-20 rounded-lg border-2 flex items-center justify-center text-xs font-bold ${
                f.length > 0 ? 'bg-green-900 border-green-600' : 'border-gray-600 bg-gray-800'
              }`}
            >
              {f.length > 0 ? (
                <span className={f[f.length - 1].color === 'red' ? 'text-red-500' : 'text-white'}>
                  {RANK_NAMES[f[f.length - 1].rank] || f[f.length - 1].rank}{f[f.length - 1].suit}
                </span>
              ) : SUITS[i]}
            </button>
          ))}
        </div>

        <div className="flex gap-1 sm:gap-2">
          {tableau.map((col, ci) => (
            <div key={ci} className="flex flex-col items-center">
              {col.length === 0 ? (
                <button onClick={() => handleTableauClick(ci)} className="w-10 h-14 sm:w-12 sm:h-16 rounded border-2 border-dashed border-gray-600" />
              ) : (
                col.map((card, ri) => (
                  <button
                    key={card.id}
                    onClick={() => ri === col.length - 1 ? handleTableauClick(ci) : undefined}
                    className={`w-10 h-14 sm:w-12 sm:h-16 rounded border text-[10px] sm:text-xs font-bold flex items-center justify-center ${
                      ri === col.length - 1 ? '-mt-8 sm:-mt-10' : '-mt-8 sm:-mt-10'
                    } ${card.faceUp ? 'bg-white border-gray-300' : 'bg-blue-800 border-blue-600'} ${
                      selected?.source === 'tableau' && selected.idx === ci && ri === col.length - 1 ? 'ring-2 ring-yellow-400' : ''
                    }`}
                  >
                    {card.faceUp ? (
                      <span className={card.color === 'red' ? 'text-red-600' : 'text-gray-900'}>
                        {RANK_NAMES[card.rank] || card.rank}{card.suit}
                      </span>
                    ) : ''}
                  </button>
                ))
              )}
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-xs">Click card to select, then click destination</p>
      </div>
    </GameLayout>
  );
}
