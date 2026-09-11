// Pure game logic - no React, no UI, no input handling

export const SUITS = ['♠', '♥', '♦', '♣'];
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export interface Card {
  suit: string;
  rank: string;
  value: number;
  id: number;
}

export interface GameState {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  isGameOver: boolean;
  result: string;
  chips: number;
  bet: number;
  isDealerRevealed: boolean;
}

export interface BlackjackConfig {
  startingChips: number;
  minBet: number;
  maxBet: number;
  dealerStandOn: number;
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  for (const suit of SUITS) {
    for (let i = 0; i < RANKS.length; i++) {
      deck.push({
        suit,
        rank: RANKS[i],
        value: RANKS[i] === 'A' ? 11 : ['J', 'Q', 'K'].includes(RANKS[i]) ? 10 : parseInt(RANKS[i]),
        id: id++,
      });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

export function handValue(cards: Card[]): number {
  let value = cards.reduce((sum, c) => sum + c.value, 0);
  let aces = cards.filter(c => c.rank === 'A').length;
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}

export function createInitialState(): GameState {
  return {
    deck: createDeck(),
    playerHand: [],
    dealerHand: [],
    isGameOver: false,
    result: '',
    chips: 100,
    bet: 10,
    isDealerRevealed: false,
  };
}

export function dealCards(deck: Card[], bet: number): {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  chips: number;
} {
  const d = createDeck();
  const ph = [d.pop()!, d.pop()!];
  const dh = [d.pop()!, d.pop()!];
  return {
    deck: d,
    playerHand: ph,
    dealerHand: dh,
    chips: -bet,
  };
}

export function hitCard(deck: Card[], playerHand: Card[]): {
  deck: Card[];
  playerHand: Card[];
  isBust: boolean;
} {
  const d = [...deck];
  const card = d.pop()!;
  const nh = [...playerHand, card];
  return {
    deck: d,
    playerHand: nh,
    isBust: handValue(nh) > 21,
  };
}

export function dealerPlay(deck: Card[], dealerHand: Card[], standOn: number = 17): {
  deck: Card[];
  dealerHand: Card[];
} {
  let dh = [...dealerHand];
  const d = [...deck];
  while (handValue(dh) < standOn) {
    dh.push(d.pop()!);
  }
  return { deck: d, dealerHand: dh };
}

export function determineResult(playerValue: number, dealerValue: number): string {
  if (dealerValue > 21) {
    return 'Dealer busts! You win! 🎉';
  } else if (playerValue > dealerValue) {
    return 'You win! 🎉';
  } else if (playerValue === dealerValue) {
    return 'Push! Bet returned.';
  } else {
    return 'Dealer wins. 🤖';
  }
}
