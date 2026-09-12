import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useSound } from '../../hooks/useSound';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import {
  Card,
  SolitaireState,
  SUITS,
  RANK_NAMES,
  createInitialState,
  resetGame,
  countFoundations,
} from './Solitaire';
import {
  handleDrawCard,
  handleFoundationClick,
  handleTableauClick,
  handleWasteClick,
} from './Solitaire.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, type Difficulty } from '../../lib/difficulty';

// Klondike's classic variants: drawing one card at a time is far more forgiving
// than drawing three (only the top of the waste is ever playable).
const DRAW_COUNT: Record<Difficulty, number> = { easy: 1, medium: 1, hard: 3 };

export default function Solitaire() {
  const { difficulty } = useDifficulty();
  const drawCount = DRAW_COUNT[difficulty];
  const scoreMultiplier = getDifficultySettings(difficulty).scoreMultiplier;

  const [gameState, setGameState] = useState<SolitaireState>(() => loadSavedState<SolitaireState>('solitaire', d => d as SolitaireState) ?? createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('solitaire'));
  const { record } = useGameResult('solitaire');
  const play = useSound();
  useGameStatePersistence('solitaire', gameState, s => s, s => !s.isWon);

  const onStateChange = (newState: SolitaireState) => {
    setGameState(newState);
    if (newState.isWon) {
      setHighScoreState(prev => {
        const best = Math.max(prev, Math.round(1000 * scoreMultiplier));
        setHighScore('solitaire', best);
        return best;
      });
    }
  };

  const onDrawCard = () => {
    play('click');
    handleDrawCard(gameState, onStateChange, drawCount);
  };

  const onFoundationClick = (foundationIdx: number) => {
    handleFoundationClick(gameState, foundationIdx, onStateChange);
  };

  const onTableauClick = (tableauIdx: number) => {
    handleTableauClick(gameState, tableauIdx, onStateChange);
  };

  const onWasteClick = () => {
    handleWasteClick(gameState, onStateChange);
  };

    useEffect(() => {
    if (gameState.isWon) {
      record({ won: true, score: Math.round(1000 * scoreMultiplier) });
    }
  }, [gameState.isWon]);

  const onReset = () => {
    clearSavedState('solitaire');
    setGameState(resetGame());
  };

  const totalFound = countFoundations(gameState.foundations);

  return (
    <GameLayout
      title="Solitaire"
      showDifficulty
      score={`${totalFound}/52 · ${gameState.moves} moves`}
      highScore={highScore}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        {gameState.isWon && <p className="text-green-400 text-xl font-bold">🎉 You Win!</p>}

        <div className="flex gap-2 sm:gap-3 items-center flex-wrap justify-center">
          <button
            onClick={onDrawCard}
            className="min-w-[48px] min-h-[48px] w-12 h-16 sm:w-14 sm:h-20 max-h-[25vh] rounded-lg bg-blue-800 hover:bg-blue-700 active:bg-blue-600 border-2 border-blue-600 flex items-center justify-center text-xl"
            style={{ touchAction: 'manipulation' }}
          >
            {gameState.stock.length > 0 ? '🂠' : '↺'}
          </button>
          <button
            onClick={onWasteClick}
            className={`min-w-[48px] min-h-[48px] w-12 h-16 sm:w-14 sm:h-20 max-h-[25vh] rounded-lg border-2 flex items-center justify-center text-xs font-bold ${
              gameState.selected?.source === 'waste'
                ? 'border-yellow-400 bg-gray-700'
                : 'border-gray-600 bg-gray-800 hover:bg-gray-700 active:bg-gray-600'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            {gameState.waste.length > 0 ? (
              <span className={gameState.waste[gameState.waste.length - 1].color === 'red' ? 'text-red-500' : 'text-white'}>
                {RANK_NAMES[gameState.waste[gameState.waste.length - 1].rank] || gameState.waste[gameState.waste.length - 1].rank}
                {gameState.waste[gameState.waste.length - 1].suit}
              </span>
            ) : (
              ''
            )}
          </button>
          <div className="w-2" />
          {gameState.foundations.map((f, i) => (
            <button
              key={i}
              onClick={() => onFoundationClick(i)}
              className={`min-w-[48px] min-h-[48px] w-12 h-16 sm:w-14 sm:h-20 max-h-[25vh] rounded-lg border-2 flex items-center justify-center text-xs font-bold ${
                f.length > 0
                  ? 'bg-green-900 border-green-600 hover:bg-green-800 active:bg-green-700'
                  : 'border-gray-600 bg-gray-800 hover:bg-gray-700 active:bg-gray-600'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {f.length > 0 ? (
                <span className={f[f.length - 1].color === 'red' ? 'text-red-500' : 'text-white'}>
                  {RANK_NAMES[f[f.length - 1].rank] || f[f.length - 1].rank}
                  {f[f.length - 1].suit}
                </span>
              ) : (
                SUITS[i]
              )}
            </button>
          ))}
        </div>

        <div className="flex gap-1 sm:gap-2 overflow-auto flex-1 w-full justify-center">
          {gameState.tableau.map((col, ci) => (
            <div key={ci} className="flex flex-col items-center">
              {col.length === 0 ? (
                <button
                  onClick={() => onTableauClick(ci)}
                  className="min-w-[48px] min-h-[48px] w-10 h-14 sm:w-12 sm:h-16 max-h-[25vh] rounded border-2 border-dashed border-gray-600 hover:border-gray-500 active:border-gray-400"
                  style={{ touchAction: 'manipulation' }}
                />
              ) : (
                col.map((card, ri) => (
                  <button
                    key={card.id}
                    onClick={() => ri === col.length - 1 ? onTableauClick(ci) : undefined}
                    className={`min-w-[48px] min-h-[48px] w-10 h-14 sm:w-12 sm:h-16 max-h-[25vh] rounded border text-[10px] sm:text-xs font-bold flex items-center justify-center ${
                      ri === col.length - 1 ? '-mt-8 sm:-mt-10' : '-mt-8 sm:-mt-10'
                    } ${
                      card.faceUp
                        ? 'bg-white border-gray-300 hover:bg-gray-50 active:bg-gray-100'
                        : 'bg-blue-800 border-blue-600 hover:bg-blue-700 active:bg-blue-600'
                    } ${
                      gameState.selected?.source === 'tableau' &&
                      gameState.selected.idx === ci &&
                      ri === col.length - 1
                        ? 'ring-2 ring-yellow-400'
                        : ''
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {card.faceUp ? (
                      <span className={card.color === 'red' ? 'text-red-600' : 'text-gray-900'}>
                        {RANK_NAMES[card.rank] || card.rank}
                        {card.suit}
                      </span>
                    ) : (
                      ''
                    )}
                  </button>
                ))
              )}
            </div>
          ))}
        </div>

        <p className="text-gray-500 text-xs">Click card to select, then click destination{drawCount > 1 ? ` · Drawing ${drawCount} cards` : ''}</p>
      </div>
    </GameLayout>
  );
}
