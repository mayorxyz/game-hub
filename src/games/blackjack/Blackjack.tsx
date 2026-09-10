import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

type Card = { suit: string; rank: string; value: number; id: number };
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  for (const suit of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      deck.push({ suit, rank: RANKS[i], value: RANKS[i] === 'A' ? 11 : ['J', 'Q', 'K'].includes(RANKS[i]) ? 10 : parseInt(RANKS[i]), id: id++ });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

function handValue(cards: Card[]): number {
  let value = cards.reduce((sum, c) => sum + c.value, 0);
  let aces = cards.filter(c => c.rank === 'A').length;
  while (value > 21 && aces > 0) { value -= 10; aces--; }
  return value;
}

export default function Blackjack() {
  const [deck, setDeck] = useState<Card[]>(createDeck);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');
  const [chips, setChips] = useState(100);
  const [bet, setBet] = useState(10);
  const [highScore, setHS] = useState(getHighScore('blackjack'));
  const [dealerRevealed, setDealerRevealed] = useState(false);

  const deal = () => {
    if (chips < bet) return;
    const d = createDeck();
    const ph = [d.pop()!, d.pop()!];
    const dh = [d.pop()!, d.pop()!];
    setDeck(d);
    setPlayerHand(ph);
    setDealerHand(dh);
    setGameOver(false);
    setResult('');
    setDealerRevealed(false);
    setChips(c => c - bet);
  };

  const hit = () => {
    const d = [...deck];
    const card = d.pop()!;
    setDeck(d);
    const nh = [...playerHand, card];
    setPlayerHand(nh);
    if (handValue(nh) > 21) {
      setGameOver(true);
      setResult('Bust! 💥');
      setDealerRevealed(true);
    }
  };

  const stand = () => {
    setDealerRevealed(true);
    let dh = [...dealerHand];
    const d = [...deck];
    while (handValue(dh) < 17) {
      dh.push(d.pop()!);
    }
    setDealerHand(dh);
    setDeck(d);

    const pv = handValue(playerHand);
    const dv = handValue(dh);
    setGameOver(true);

    if (dv > 21) {
      setResult('Dealer busts! You win! 🎉');
      setChips(c => {
        const nc = c + bet * 2;
        setHS(h => {
          const best = Math.max(h, nc);
          setHighScore('blackjack', best);
          return best;
        });
        return nc;
      });
    } else if (pv > dv) {
      setResult('You win! 🎉');
      setChips(c => {
        const nc = c + bet * 2;
        setHS(h => {
          const best = Math.max(h, nc);
          setHighScore('blackjack', best);
          return best;
        });
        return nc;
      });
    } else if (pv === dv) {
      setResult('Push! Bet returned.');
      setChips(c => c + bet);
    } else {
      setResult('Dealer wins. 🤖');
    }
  };

  const reset = () => {
    setChips(100);
    setPlayerHand([]);
    setDealerHand([]);
    setGameOver(false);
    setResult('');
  };

  const CardDisplay = ({ card, hidden }: { card: Card; hidden?: boolean }) => (
    <div className={`w-14 h-20 sm:w-16 sm:h-24 rounded-lg border-2 flex flex-col items-center justify-center font-bold text-sm sm:text-base ${
      hidden ? 'bg-blue-800 border-blue-600' : 'bg-white border-gray-300'
    }`}>
      {hidden ? '?' : (
        <>
          <span className={`${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-gray-900'}`}>
            {card.rank}
          </span>
          <span className={`text-lg ${card.suit === '♥' || card.suit === '♦' ? 'text-red-600' : 'text-gray-900'}`}>
            {card.suit}
          </span>
        </>
      )}
    </div>
  );

  return (
    <GameLayout title="Blackjack" score={`$${chips}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center gap-4">
        {result && <p className="text-xl font-bold text-amber-400">{result}</p>}

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Dealer {dealerRevealed ? `(${handValue(dealerHand)})` : ''}</p>
          <div className="flex gap-2 justify-center">
            {dealerHand.map((card, i) => (
              <CardDisplay key={card.id} card={card} hidden={!dealerRevealed && i === 1} />
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">You ({handValue(playerHand)})</p>
          <div className="flex gap-2 justify-center">
            {playerHand.map(card => (
              <CardDisplay key={card.id} card={card} />
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          {gameOver || playerHand.length === 0 ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Bet:</span>
                <button onClick={() => setBet(b => Math.max(5, b - 5))} className="w-8 h-8 bg-gray-700 rounded-lg">-</button>
                <span className="text-white font-bold">${bet}</span>
                <button onClick={() => setBet(b => Math.min(chips, b + 5))} className="w-8 h-8 bg-gray-700 rounded-lg">+</button>
              </div>
              <button onClick={deal} disabled={chips < bet} className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg font-bold disabled:opacity-50">
                Deal
              </button>
            </div>
          ) : (
            <>
              <button onClick={hit} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg font-bold">Hit</button>
              <button onClick={stand} className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg font-bold">Stand</button>
            </>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
