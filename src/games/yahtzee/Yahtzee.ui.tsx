import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import {
  YahtzeeState,
  CATEGORIES,
  Category,
  CategoryId,
  MAX_ROLLS,
  createInitialState,
  scoreFor,
  upperSubtotal,
  upperBonus,
  totalScore,
} from './Yahtzee';
import {
  handleRoll,
  handleToggleKeep,
  handleScoreCategory,
} from './Yahtzee.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings } from '../../lib/difficulty';

const PIPS: Record<number, string> = {
  1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅',
};

export default function Yahtzee() {
  const { difficulty } = useDifficulty();
  const difficultySettings = getDifficultySettings(difficulty);
  // Fewer re-rolls on harder settings (inverse of the complexity multiplier).
  const maxRolls = Math.max(2, Math.round(MAX_ROLLS / difficultySettings.complexityMultiplier));
  const scoreMultiplier = difficultySettings.scoreMultiplier;

  const [gameState, setGameState] = useState<YahtzeeState>(() => loadSavedState<YahtzeeState>('yahtzee', d => d as YahtzeeState) ?? createInitialState(maxRolls));
  const [highScore, setHighScoreState] = useState(getHighScore('yahtzee'));
  const { record } = useGameResult('yahtzee');
  useGameStatePersistence("yahtzee", gameState, s => s, s => !s.isGameOver);
  const play = useSound();

  const canRoll = gameState.rollsLeft > 0 && !gameState.isGameOver;
  const canScore = gameState.rollsLeft < maxRolls && !gameState.isGameOver;
  const finalScore = Math.round(totalScore(gameState) * scoreMultiplier);

  useEffect(() => {
    if (gameState.isGameOver) {
      const score = Math.round(totalScore(gameState) * scoreMultiplier);
      record({ won: false, score });
      setHighScoreState(prev => {
        const best = Math.max(prev, score);
        setHighScore('yahtzee', best);
        return best;
      });
    }
  }, [gameState.isGameOver, scoreMultiplier]);

  const onRoll = () => {
    if (!canRoll) return;
    play('move');
    handleRoll(gameState, setGameState);
  };

  const onToggleKeep = (index: number) => {
    if (!canScore) return;
    play('click');
    handleToggleKeep(gameState, index, setGameState, maxRolls);
  };

  const onScore = (id: CategoryId) => {
    play('success');
    handleScoreCategory(gameState, id, setGameState, maxRolls);
  };

  const onReset = () => {
    clearSavedState('yahtzee');
    setGameState(createInitialState(maxRolls));
  };

  const upper = CATEGORIES.filter(c => c.section === 'upper');
  const lower = CATEGORIES.filter(c => c.section === 'lower');

  const renderCategory = (c: Category) => {
    const filled = c.id in gameState.scores;
    const preview = canScore ? scoreFor(c.id, gameState.dice) : null;
    const value = filled ? gameState.scores[c.id] : preview;
    return (
      <button
        key={c.id}
        onClick={() => { if (!filled && canScore) onScore(c.id); }}
        disabled={filled || !canScore}
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-colors ${
          filled
            ? 'bg-white/5 text-gray-400'
            : canScore
              ? 'bg-white/10 hover:bg-white/20 text-white'
              : 'bg-white/5 text-gray-500'
        }`}
      >
        <span className="truncate">{c.name}</span>
        <span className="font-bold tabular-nums">{value !== undefined ? value : '—'}</span>
      </button>
    );
  };

  return (
    <GameLayout title="Yahtzee" showDifficulty score={totalScore(gameState)} highScore={highScore} onReset={onReset}>
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 p-3">
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="flex flex-wrap justify-center gap-2">
            {gameState.dice.map((d, i) => (
              <button
                key={i}
                onClick={() => onToggleKeep(i)}
                disabled={!canScore}
                aria-label={`Die ${i + 1}: ${d}${gameState.kept[i] ? ', held' : ''}`}
                aria-pressed={gameState.kept[i]}
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center transition-all ${
                  gameState.kept[i] ? 'bg-cyan-600 ring-2 ring-cyan-300' : 'bg-white/10 hover:bg-white/20'
                } ${!canScore ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="text-4xl leading-none text-white">{PIPS[d]}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={onRoll}
              disabled={!canRoll}
              className={`px-6 py-3 rounded-xl font-bold transition-colors ${
                canRoll ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-white/10 text-gray-500'
              }`}
            >
              {gameState.rollsLeft === maxRolls ? 'Roll' : `Re-roll (${gameState.rollsLeft} left)`}
            </button>
            <div className="text-sm text-gray-400 text-center">
              {canScore ? 'Tap dice to hold, then pick a category' : 'Roll to begin'}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm">
            <span className="text-gray-400">Upper: <span className="text-white font-bold tabular-nums">{upperSubtotal(gameState)}</span></span>
            <span className="text-gray-400">Bonus: <span className={upperBonus(gameState) > 0 ? 'text-green-400 font-bold tabular-nums' : 'text-white font-bold tabular-nums'}>{upperBonus(gameState)}</span></span>
            <span className="text-gray-400">Total: <span className="text-cyan-400 font-bold tabular-nums">{totalScore(gameState)}</span></span>
          </div>
        </div>

        <div className="md:w-64 flex flex-col gap-1.5">
          <div className="text-xs uppercase tracking-wide text-gray-500">Upper section</div>
          {upper.map(renderCategory)}
          <div className="text-xs uppercase tracking-wide text-gray-500 mt-2">Lower section</div>
          {lower.map(renderCategory)}

          {gameState.isGameOver && (
            <div className="mt-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
              <div className="text-lg font-bold text-green-400">Final score: {finalScore}</div>
            </div>
          )}
        </div>
      </div>
    </GameLayout>
  );
}
