// Pure game logic for Idle Clicker - no React, no UI, no input handling

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  cps: number;
  count: number;
  icon: string;
}

export const INIT_UPGRADES: Upgrade[] = [
  { id: 'cursor', name: 'Auto Cursor', cost: 15, cps: 0.1, count: 0, icon: '👆' },
  { id: 'robot', name: 'Robot Arm', cost: 100, cps: 1, count: 0, icon: '🤖' },
  { id: 'factory', name: 'Factory', cost: 500, cps: 5, count: 0, icon: '🏭' },
  { id: 'mine', name: 'Gold Mine', cost: 2000, cps: 20, count: 0, icon: '⛏️' },
  { id: 'lab', name: 'Research Lab', cost: 10000, cps: 100, count: 0, icon: '🔬' },
  { id: 'portal', name: 'Money Portal', cost: 50000, cps: 500, count: 0, icon: '🌀' },
];

export interface IdleClickerState {
  coins: number;
  upgrades: Upgrade[];
  clickPower: number;
}

export function createInitialState(): IdleClickerState {
  return {
    coins: 0,
    upgrades: INIT_UPGRADES.map(u => ({ ...u })),
    clickPower: 1,
  };
}

export function calculateCPS(upgrades: Upgrade[]): number {
  return upgrades.reduce((sum, u) => sum + u.cps * u.count, 0);
}

export function click(state: IdleClickerState): IdleClickerState {
  return {
    ...state,
    coins: state.coins + state.clickPower,
  };
}

export function buyUpgrade(state: IdleClickerState, idx: number): IdleClickerState {
  const upgrade = state.upgrades[idx];
  if (state.coins < upgrade.cost) return state;

  const newUpgrades = state.upgrades.map((u, i) =>
    i === idx
      ? { ...u, count: u.count + 1, cost: Math.floor(u.cost * 1.15) }
      : u
  );

  return {
    ...state,
    coins: state.coins - upgrade.cost,
    upgrades: newUpgrades,
  };
}

export function resetGame(): IdleClickerState {
  return createInitialState();
}
