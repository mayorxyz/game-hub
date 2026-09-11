import React, { useState, useEffect } from 'react';
import { getHighScore, setHighScore } from '../../lib/persistence';
import GameLayout from '../../components/ui/GameLayout';
import {
  Card,
  GameState,
  createInitialState,
  flipCard,
  matchCards,
  unflipCards,
  checkMatch,
  checkAllMatched,
} from './MemoryMatch';
import { handleCardClick } from './MemoryMatch.controls';

export default function MemoryMatch() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const storedBest = getHighScore('memory-match');
  const [bestMoves, setBestMoves] = useState<number>(storedBest > 0 ? 10000 - storedBest : Infinity);

  // Handle card selection and matching logic
  useEffect(() => {
    if (gameState.selected.length === 2) {
      const [a, b] = gameState.selected;
      
      if (checkMatch(gameState.cards, a, b)) {
        // Cards match - mark as matched
        const matchedCards = matchCards(gameState.cards, a, b);
        const isWon = checkAllMatched(matchedCards);
        setGameState(prev => ({
          ...prev,
          cards: matchedCards,
          selected: [],
          moves: prev.moves + 1,
          isWon,
        }));
      } else {
        // Cards don't match - flip back after delay
        setTimeout(() => {
          const unflippedCards = unflipCards(gameState.cards, a, b);
          setGameState(prev => ({
            ...prev,
            cards: unflippedCards,
            selected: [],
            moves: prev.moves + 1,
          }));
        }, 800);
      }
    }
  }, [gameState.selected, gameState.cards]);

  // Update best moves when game is won
  useEffect(() => {
    if (gameState.isWon && gameState.moves > 0) {
      if (gameState.moves < bestMoves) {
        setBestMoves(gameState.moves);
        setHighScore('memory-match', 10000 - gameState.moves);
      }
    }
  }, [gameState.isWon, gameState.moves, bestMoves]);

  const onCardClick = (idx: number) => {
    handleCardClick(
      gameState.cards,
      gameState.selected,
      idx,
      (flipIdx) => {
        setGameState(prev => ({
          ...prev,
          cards: flipCard(prev.cards, flipIdx),
        }));
      },
      (newSelected) => {
        setGameState(prev => ({
          ...prev,
          selected: newSelected,
        }));
      }
    );
  };

  const reset = () => {
    setGameState(createInitialState());
    setBestMoves(storedBest > 0 ? 10000 - storedBest : Infinity);
  };

  return (
    <GameLayout
      title="Memory Match"
      score={`${gameState.moves} moves`}
      highScore={bestMoves !== Infinity ? bestMoves : undefined}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.isWon && <p className="text-green-400 text-xl font-bold">🎉 You Win!</p>}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid grid-cols-4 gap-2">
            {gameState.cards.map((card, i) => (
              <button
                key={card.id}
                onClick={() => onCardClick(i)}
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
