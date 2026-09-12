import React, { useState, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  Choice,
  CHOICES,
  EMOJIS,
  GameState,
  createInitialState,
  botChoice,
  getResult,
  getResultText,
} from './RockPaperScissors';
import { handleChoiceSelect } from './RockPaperScissors.controls';
import { useSound } from '../../hooks/useSound';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings } from '../../lib/difficulty';

export default function RockPaperScissors() {
  const { difficulty } = useDifficulty();
  // How often the bot exploits your most frequent choice instead of throwing randomly.
  const predictionChance = Math.min(1, getDifficultySettings(difficulty).complexityMultiplier * 0.7);

  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('rock-paper-scissors'));
  const play = useSound();

  // Handle player choice
  const onPlay = useCallback((choice: Choice) => {
    const bot = botChoice(gameState.history, predictionChance);
    const result = getResult(choice, bot);
    const resultText = getResultText(result);
    
    const newHistory = [...gameState.history, { player: choice, bot }];
    const newScore = { ...gameState.score };
    
    if (result === 'win') newScore.wins++;
    else if (result === 'lose') newScore.losses++;
    else newScore.draws++;

    play(result === 'win' ? 'success' : result === 'lose' ? 'gameover' : 'click');

    setGameState({
      history: newHistory,
      lastResult: { player: choice, bot, result: resultText },
      score: newScore,
    });

    setHighScoreState(prev => {
      const best = Math.max(prev, newScore.wins);
      setHighScore('rock-paper-scissors', best);
      return best;
    });
  }, [gameState.history, gameState.score, predictionChance]);

  const onChoiceClick = useCallback((choice: Choice) => {
    handleChoiceSelect(choice, onPlay);
  }, [onPlay]);

  const reset = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  return (
    <GameLayout
      title="Rock Paper Scissors"
      showDifficulty
      score={`W:${gameState.score.wins} L:${gameState.score.losses} D:${gameState.score.draws}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-between w-full h-full gap-6">
        {gameState.lastResult && (
          <div className="flex items-center gap-6 text-5xl sm:text-6xl">
            <div className="text-center">
              <div>{EMOJIS[gameState.lastResult.player]}</div>
              <p className="text-xs text-gray-400 mt-1">You</p>
            </div>
            <span className="text-2xl text-gray-500">vs</span>
            <div className="text-center">
              <div>{EMOJIS[gameState.lastResult.bot]}</div>
              <p className="text-xs text-gray-400 mt-1">Bot</p>
            </div>
          </div>
        )}
        {gameState.lastResult && (
          <p className={`text-xl font-bold ${
            gameState.lastResult.result === 'You win!' ? 'text-green-400' : 
            gameState.lastResult.result === 'Bot wins!' ? 'text-red-400' : 
            'text-amber-400'
          }`}>
            {gameState.lastResult.result}
          </p>
        )}
        <div className="flex gap-4">
          {CHOICES.map(choice => (
            <button
              key={choice}
              onClick={() => onChoiceClick(choice)}
              className="min-w-[64px] min-h-[64px] w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-3xl sm:text-4xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
              style={{ touchAction: 'manipulation' }}
            >
              {EMOJIS[choice]}
            </button>
          ))}
        </div>
        <p className="text-gray-500 text-xs">Bot learns your patterns!</p>
      </div>
    </GameLayout>
  );
}
