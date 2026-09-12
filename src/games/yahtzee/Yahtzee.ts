// Pure game logic for Yahtzee - no React, no UI, no input handling

export const DICE_COUNT = 5;
export const MAX_ROLLS = 3;
export const UPPER_BONUS = 35;
export const UPPER_BONUS_THRESHOLD = 63;

export type CategoryId =
  | 'ones' | 'twos' | 'threes' | 'fours' | 'fives' | 'sixes'
  | 'threeKind' | 'fourKind' | 'fullHouse'
  | 'smallStraight' | 'largeStraight' | 'yahtzee' | 'chance';

export interface Category {
  id: CategoryId;
  name: string;
  section: 'upper' | 'lower';
}

export const CATEGORIES: Category[] = [
  { id: 'ones', name: 'Ones', section: 'upper' },
  { id: 'twos', name: 'Twos', section: 'upper' },
  { id: 'threes', name: 'Threes', section: 'upper' },
  { id: 'fours', name: 'Fours', section: 'upper' },
  { id: 'fives', name: 'Fives', section: 'upper' },
  { id: 'sixes', name: 'Sixes', section: 'upper' },
  { id: 'threeKind', name: 'Three of a Kind', section: 'lower' },
  { id: 'fourKind', name: 'Four of a Kind', section: 'lower' },
  { id: 'fullHouse', name: 'Full House', section: 'lower' },
  { id: 'smallStraight', name: 'Small Straight', section: 'lower' },
  { id: 'largeStraight', name: 'Large Straight', section: 'lower' },
  { id: 'yahtzee', name: 'Yahtzee', section: 'lower' },
  { id: 'chance', name: 'Chance', section: 'lower' },
];

export interface YahtzeeState {
  dice: number[];
  kept: boolean[];
  rollsLeft: number;
  scores: Partial<Record<CategoryId, number>>;
  isGameOver: boolean;
}

export function createInitialState(maxRolls: number = MAX_ROLLS): YahtzeeState {
  return {
    dice: [1, 1, 1, 1, 1],
    kept: Array(DICE_COUNT).fill(false),
    rollsLeft: maxRolls,
    scores: {},
    isGameOver: false,
  };
}

export function rollDice(state: YahtzeeState, rand: () => number = Math.random): YahtzeeState {
  if (state.rollsLeft <= 0 || state.isGameOver) return state;
  const dice = state.dice.map((d, i) => (state.kept[i] ? d : 1 + Math.floor(rand() * 6)));
  return { ...state, dice, rollsLeft: state.rollsLeft - 1 };
}

export function toggleKeep(state: YahtzeeState, index: number, maxRolls: number = MAX_ROLLS): YahtzeeState {
  // Dice can only be held after the first roll and before scoring.
  if (state.rollsLeft === maxRolls || state.rollsLeft <= 0 || state.isGameOver) return state;
  if (index < 0 || index >= DICE_COUNT) return state;
  const kept = state.kept.map((k, i) => (i === index ? !k : k));
  return { ...state, kept };
}

function tally(dice: number[]): number[] {
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const d of dice) counts[d]++;
  return counts;
}

export function scoreFor(category: CategoryId, dice: number[]): number {
  const counts = tally(dice);
  const sum = dice.reduce((a, b) => a + b, 0);
  const unique = [...new Set(dice)].sort((a, b) => a - b);

  switch (category) {
    case 'ones': return counts[1] * 1;
    case 'twos': return counts[2] * 2;
    case 'threes': return counts[3] * 3;
    case 'fours': return counts[4] * 4;
    case 'fives': return counts[5] * 5;
    case 'sixes': return counts[6] * 6;
    case 'threeKind': return counts.some(c => c >= 3) ? sum : 0;
    case 'fourKind': return counts.some(c => c >= 4) ? sum : 0;
    case 'fullHouse': {
      const hasThree = counts.some(c => c === 3);
      const hasTwo = counts.some(c => c === 2);
      return hasThree && hasTwo ? 25 : 0;
    }
    case 'smallStraight': {
      const runs = [[1, 2, 3, 4], [2, 3, 4, 5], [3, 4, 5, 6]];
      return runs.some(r => r.every(x => unique.includes(x))) ? 30 : 0;
    }
    case 'largeStraight': {
      const key = unique.join('');
      return key === '12345' || key === '23456' ? 40 : 0;
    }
    case 'yahtzee': return counts.some(c => c === 5) ? 50 : 0;
    case 'chance': return sum;
  }
}

export function applyCategory(state: YahtzeeState, category: CategoryId, maxRolls: number = MAX_ROLLS): YahtzeeState {
  if (state.isGameOver || state.rollsLeft === maxRolls) return state;
  if (category in state.scores) return state;

  const scores = { ...state.scores, [category]: scoreFor(category, state.dice) };
  const isGameOver = Object.keys(scores).length >= CATEGORIES.length;

  return {
    ...state,
    scores,
    kept: Array(DICE_COUNT).fill(false),
    rollsLeft: maxRolls,
    isGameOver,
  };
}

export function upperSubtotal(state: YahtzeeState): number {
  return CATEGORIES.filter(c => c.section === 'upper')
    .reduce((sum, c) => sum + (state.scores[c.id] ?? 0), 0);
}

export function upperBonus(state: YahtzeeState): number {
  return upperSubtotal(state) >= UPPER_BONUS_THRESHOLD ? UPPER_BONUS : 0;
}

export function totalScore(state: YahtzeeState): number {
  const base = CATEGORIES.reduce((sum, c) => sum + (state.scores[c.id] ?? 0), 0);
  return base + upperBonus(state);
}

export function resetGame(maxRolls: number = MAX_ROLLS): YahtzeeState {
  return createInitialState(maxRolls);
}
