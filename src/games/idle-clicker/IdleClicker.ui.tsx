import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  IdleClickerState,
  createInitialState,
  calculateCPS,
  resetGame,
} from './IdleClicker';
import { handleClick, handleBuyUpgrade } from './IdleClicker.controls';

export default function IdleClicker() {
  const [gameState, setGameState] = useState<IdleClickerState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('idle-clicker'));
  const coinsRef = useRef(0);

  const cps = calculateCPS(gameState.upgrades);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => {
        const nc = prev.coins + cps / 10;
        coinsRef.current = nc;
        setHighScoreState(h => {
          const best = Math.max(h, Math.floor(nc));
          setHighScore('idle-clicker', best);
          return best;
        });
        return { ...prev, coins: nc };
      });
    }, 100);
    return () => clearInterval(interval);
  }, [cps]);

  const onClick = (newState: IdleClickerState) => {
    setGameState(newState);
  };

  const onBuy = (newState: IdleClickerState) => {
    setGameState(newState);
  };

  const onReset = () => {
    setGameState(resetGame());
  };

  return (
    <GameLayout
      title="Idle Clicker"
      score={`${Math.floor(gameState.coins)} coins`}
      highScore={highScore}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        <button
          onClick={() => handleClick(gameState, onClick)}
          className="min-w-[128px] min-h-[128px] w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-5xl sm:text-6xl shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          💰
        </button>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-400">{Math.floor(gameState.coins).toLocaleString()} coins</p>
          <p className="text-gray-400 text-sm">{cps.toFixed(1)} coins/sec · +{gameState.clickPower}/click</p>
        </div>

        <div className="w-full max-w-sm space-y-2 overflow-auto flex-1">
          {gameState.upgrades.map((u, i) => (
            <button
              key={u.id}
              onClick={() => handleBuyUpgrade(gameState, i, onBuy)}
              disabled={gameState.coins < u.cost}
              className={`w-full min-h-[48px] flex items-center gap-3 p-3 rounded-lg transition-all ${
                gameState.coins >= u.cost
                  ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500'
                  : 'bg-gray-800 opacity-50 cursor-not-allowed'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-2xl">{u.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-white">
                  {u.name} <span className="text-gray-400">×{u.count}</span>
                </p>
                <p className="text-xs text-gray-400">+{u.cps}/sec</p>
              </div>
              <span className="text-amber-400 font-bold text-sm">{u.cost.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </div>
    </GameLayout>
  );
}
