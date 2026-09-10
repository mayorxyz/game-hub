import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

interface Upgrade { id: string; name: string; cost: number; cps: number; count: number; icon: string; }

const INIT_UPGRADES: Upgrade[] = [
  { id: 'cursor', name: 'Auto Cursor', cost: 15, cps: 0.1, count: 0, icon: '👆' },
  { id: 'robot', name: 'Robot Arm', cost: 100, cps: 1, count: 0, icon: '🤖' },
  { id: 'factory', name: 'Factory', cost: 500, cps: 5, count: 0, icon: '🏭' },
  { id: 'mine', name: 'Gold Mine', cost: 2000, cps: 20, count: 0, icon: '⛏️' },
  { id: 'lab', name: 'Research Lab', cost: 10000, cps: 100, count: 0, icon: '🔬' },
  { id: 'portal', name: 'Money Portal', cost: 50000, cps: 500, count: 0, icon: '🌀' },
];

export default function IdleClicker() {
  const [coins, setCoins] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INIT_UPGRADES);
  const [clickPower, setClickPower] = useState(1);
  const [highScore, setHS] = useState(getHighScore('idle-clicker'));
  const coinsRef = useRef(0);

  const cps = upgrades.reduce((sum, u) => sum + u.cps * u.count, 0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(c => {
        const nc = c + cps / 10;
        coinsRef.current = nc;
        setHS(h => {
          const best = Math.max(h, Math.floor(nc));
          setHighScore('idle-clicker', best);
          return best;
        });
        return nc;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [cps]);

  const click = () => {
    setCoins(c => c + clickPower);
  };

  const buyUpgrade = (idx: number) => {
    const u = upgrades[idx];
    if (coins < u.cost) return;
    setCoins(c => c - u.cost);
    setUpgrades(prev => prev.map((up, i) => i === idx ? { ...up, count: up.count + 1, cost: Math.floor(up.cost * 1.15) } : up));
  };

  const reset = () => {
    setCoins(0);
    setUpgrades(INIT_UPGRADES);
    setClickPower(1);
  };

  return (
    <GameLayout title="Idle Clicker" score={`${Math.floor(coins)} coins`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        <button
          onClick={click}
          className="min-w-[128px] min-h-[128px] w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-5xl sm:text-6xl shadow-lg shadow-amber-500/30 hover:scale-105 active:scale-95 transition-transform"
          style={{ touchAction: 'manipulation' }}
        >
          💰
        </button>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-400">{Math.floor(coins).toLocaleString()} coins</p>
          <p className="text-gray-400 text-sm">{cps.toFixed(1)} coins/sec · +{clickPower}/click</p>
        </div>

        <div className="w-full max-w-sm space-y-2 overflow-auto flex-1">
          {upgrades.map((u, i) => (
            <button
              key={u.id}
              onClick={() => buyUpgrade(i)}
              disabled={coins < u.cost}
              className={`w-full min-h-[48px] flex items-center gap-3 p-3 rounded-lg transition-all ${
                coins >= u.cost ? 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500' : 'bg-gray-800 opacity-50 cursor-not-allowed'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              <span className="text-2xl">{u.icon}</span>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-white">{u.name} <span className="text-gray-400">×{u.count}</span></p>
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
