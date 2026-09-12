import React, { useState, useCallback, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useSound } from '../../hooks/useSound';
import {
  Card,
  GameState,
  createInitialState,
  handValue,
  dealCards,
  hitCard,
  dealerPlay,
  determineResult,
} from './Blackjack';
import { handleDeal, handleBetChange } from './Blackjack.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, type Difficulty } from '../../lib/difficulty';

// A dealer that stands on a higher total is harder to beat.
const DEALER_STAND_ON: Record<Difficulty, number> = { easy: 16, medium: 17, hard: 18 };

export default function Blackjack() {
  const { difficulty } = useDifficulty();
  const scoreMultiplier = getDifficultySettings(difficulty).scoreMultiplier;
  const dealerStandOn = DEALER_STAND_ON[difficulty];

  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('blackjack'));
  const { record } = useGameResult('blackjack');
  const play = useSound();

  const onDeal = useCallback(() => {
    play('move');
    const { deck, playerHand, dealerHand, chips } = dealCards(gameState.deck, gameState.bet);
    setGameState(prev => ({
      ...prev,
      deck,
      playerHand,
      dealerHand,
      chips: prev.chips + chips,
      isGameOver: false,
      result: '',
      isDealerRevealed: false,
    }));
  }, [gameState.deck, gameState.bet]);

  const onDealClick = useCallback(() => {
    handleDeal(gameState.chips, gameState.bet, onDeal);
  }, [gameState.chips, gameState.bet, onDeal]);

  const onHit = useCallback(() => {
    const { deck, playerHand, isBust } = hitCard(gameState.deck, gameState.playerHand);
    setGameState(prev => ({
      ...prev,
      deck,
      playerHand,
      isGameOver: isBust,
      result: isBust ? 'Bust! 💥' : '',
      isDealerRevealed: isBust,
    }));
  }, [gameState.deck, gameState.playerHand]);

  const onStand = useCallback(() => {
    const { deck, dealerHand } = dealerPlay(gameState.deck, gameState.dealerHand, dealerStandOn);
    const playerValue = handValue(gameState.playerHand);
    const dealerValue = handValue(dealerHand);
    const result = determineResult(playerValue, dealerValue);
    
    let chipsChange = 0;
    if (result.includes('win')) {
      chipsChange = Math.round(gameState.bet * 2 * scoreMultiplier);
      setHighScoreState(prev => {
        const best = Math.max(prev, gameState.chips + chipsChange);
        setHighScore('blackjack', best);
        return best;
      });
    } else if (result === 'Push! Bet returned.') {
      chipsChange = gameState.bet;
    }

    setGameState(prev => ({
      ...prev,
      deck,
      dealerHand,
      chips: prev.chips + chipsChange,
      isGameOver: true,
      result,
      isDealerRevealed: true,
    }));
  }, [gameState, dealerStandOn, scoreMultiplier]);

  const onBetChange = useCallback((direction: 'increase' | 'decrease') => {
    handleBetChange(gameState.bet, gameState.chips, 5, gameState.chips, direction, (newBet) => {
      setGameState(prev => ({ ...prev, bet: newBet }));
    });
  }, [gameState.bet, gameState.chips]);

    useEffect(() => {
    if (gameState.isGameOver) {
      record({ won: gameState.result.includes('You win'), score: gameState.chips });
    }
  }, [gameState.isGameOver]);

  const reset = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  const CardDisplay = ({ card, hidden }: { card: Card; hidden?: boolean }) => (
    <div className={`w-14 h-20 sm:w-16 sm:h-24 max-h-[25vh] rounded-lg border-2 flex flex-col items-center justify-center font-bold text-sm sm:text-base ${
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
    <GameLayout
      title="Blackjack"
      showDifficulty
      score={`$${gameState.chips}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        {gameState.result && <p className="text-xl font-bold text-amber-400">{gameState.result}</p>}

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">
            Dealer {gameState.isDealerRevealed ? `(${handValue(gameState.dealerHand)})` : ''}
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            {gameState.dealerHand.map((card, i) => (
              <CardDisplay key={card.id} card={card} hidden={!gameState.isDealerRevealed && i === 1} />
            ))}
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">You ({handValue(gameState.playerHand)})</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {gameState.playerHand.map(card => (
              <CardDisplay key={card.id} card={card} />
            ))}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center">
          {gameState.isGameOver || gameState.playerHand.length === 0 ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">Bet:</span>
                <button
                  onClick={() => onBetChange('decrease')}
                  className="min-w-[48px] min-h-[48px] w-8 h-8 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg"
                  style={{ touchAction: 'manipulation' }}
                >
                  -
                </button>
                <span className="text-white font-bold">${gameState.bet}</span>
                <button
                  onClick={() => onBetChange('increase')}
                  className="min-w-[48px] min-h-[48px] w-8 h-8 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg"
                  style={{ touchAction: 'manipulation' }}
                >
                  +
                </button>
              </div>
              <button
                onClick={onDealClick}
                disabled={gameState.chips < gameState.bet}
                className="min-h-[48px] px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg font-bold disabled:opacity-50"
                style={{ touchAction: 'manipulation' }}
              >
                Deal
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={onHit}
                className="min-h-[48px] px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg font-bold"
                style={{ touchAction: 'manipulation' }}
              >
                Hit
              </button>
              <button
                onClick={onStand}
                className="min-h-[48px] px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg font-bold"
                style={{ touchAction: 'manipulation' }}
              >
                Stand
              </button>
            </>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
