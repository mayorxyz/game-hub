import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

type Choice = 'rock' | 'paper' | 'scissors';
const CHOICES: Choice[] = ['rock', 'paper', 'scissors'];
const EMOJIS: Record<Choice, string> = { rock: '✊', paper: '✋', scissors: '✌️' };

function botChoice(history: { player: Choice; bot: Choice }[]): Choice {
  if (history.length < 3) return CHOICES[Math.floor(Math.random() * 3)];
  const counts: Record<Choice, number> = { rock: 0, paper: 0, scissors: 0 };
  history.forEach(h => counts[h.player]++);
  const predicted = (Object.entries(counts) as [Choice, number][]).sort((a, b) => b[1] - a[1])[0][0];
  const counter: Record<Choice, Choice> = { rock: 'paper', paper: 'scissors', scissors: 'rock' };
  return counter[predicted];
}

function getResult(player: Choice, bot: Choice): 'win' | 'lose' | 'draw' {
  if (player === bot) return 'draw';
  if ((player === 'rock' && bot === 'scissors') || (player === 'paper' && bot === 'rock') || (player === 'scissors' && bot === 'paper')) return 'win';
  return 'lose';
}

export default function RockPaperScissors() {
  const [history, setHistory] = useState<{ player: Choice; bot: Choice }[]>([]);
  const [lastResult, setLastResult] = useState<{ player: Choice; bot: Choice; result: string } | null>(null);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [highScore, setHS] = useState(getHighScore('rock-paper-scissors'));

  const play = (choice: Choice) => {
    const bot = botChoice(history);
    const result = getResult(choice, bot);
    setHistory(prev => [...prev, { player: choice, bot }]);
    setLastResult({ player: choice, bot, result: result === 'win' ? 'You win!' : result === 'lose' ? 'Bot wins!' : 'Draw!' });
    setScore(prev => {
      const ns = { ...prev };
      if (result === 'win') ns.wins++;
      else if (result === 'lose') ns.losses++;
      else ns.draws++;
      setHS(h => {
        const best = Math.max(h, ns.wins);
        setHighScore('rock-paper-scissors', best);
        return best;
      });
      return ns;
    });
  };

  const reset = () => {
    setHistory([]);
    setLastResult(null);
    setScore({ wins: 0, losses: 0, draws: 0 });
  };

  return (
    <GameLayout title="Rock Paper Scissors" score={`W:${score.wins} L:${score.losses} D:${score.draws}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center gap-6">
        {lastResult && (
          <div className="flex items-center gap-6 text-5xl sm:text-6xl">
            <div className="text-center">
              <div>{EMOJIS[lastResult.player]}</div>
              <p className="text-xs text-gray-400 mt-1">You</p>
            </div>
            <span className="text-2xl text-gray-500">vs</span>
            <div className="text-center">
              <div>{EMOJIS[lastResult.bot]}</div>
              <p className="text-xs text-gray-400 mt-1">Bot</p>
            </div>
          </div>
        )}
        {lastResult && (
          <p className={`text-xl font-bold ${lastResult.result === 'You win!' ? 'text-green-400' : lastResult.result === 'Bot wins!' ? 'text-red-400' : 'text-amber-400'}`}>
            {lastResult.result}
          </p>
        )}
        <div className="flex gap-4">
          {CHOICES.map(choice => (
            <button
              key={choice}
              onClick={() => play(choice)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-700 hover:bg-gray-600 text-3xl sm:text-4xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
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
