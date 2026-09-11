// Pure game logic for Solitaire - no React, no UI, no input handling

export type Suit = '♠' | '♥' | '♦' | '♣';
export type Color = 'red' | 'black';

export interface Card {
  suit: Suit;
  rank: number;
  color: Color;
  id: number;
  faceUp: boolean;
}

export interface SolitaireState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  moves: number;
  isWon: boolean;
  selected: { source: string; idx: number } | null;
}

export const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
export const RANK_NAMES: Record<number, string> = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };

export function createDeck(): Card[] {
  const deck: Card[] = [];
  let id = 0;
  for (const suit of SUITS) {
    const color: Color = suit === '♥' || suit === '♦' ? 'red' : 'black';
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({ suit, rank, color, id: id++, faceUp: false });
    }
  }
  return deck.sort(() => Math.random() - 0.5);
}

export function initializeGame(): { stock: Card[]; tableau: Card[][] } {
  const deck = createDeck().map(c => ({ ...c, faceUp: false }));
  const tabs: Card[][] = [[], [], [], [], [], [], []];
  let di = 0;
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[di], faceUp: row === col };
      tabs[col].push(card);
      di++;
    }
  }
  return {
    stock: deck.slice(di).map(c => ({ ...c, faceUp: false })),
    tableau: tabs,
  };
}

export function createInitialState(): SolitaireState {
  const initial = initializeGame();
  return {
    stock: initial.stock,
    waste: [],
    foundations: [[], [], [], []],
    tableau: initial.tableau,
    moves: 0,
    isWon: false,
    selected: null,
  };
}

export function canPlaceOnFoundation(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) return card.rank === 1;
  const top = foundation[foundation.length - 1];
  return card.suit === top.suit && card.rank === top.rank + 1;
}

export function canPlaceOnTableau(card: Card, tableau: Card[]): boolean {
  if (tableau.length === 0) return card.rank === 13;
  const top = tableau[tableau.length - 1];
  return top.faceUp && card.color !== top.color && card.rank === top.rank - 1;
}

export function drawCard(state: SolitaireState): SolitaireState {
  if (state.stock.length === 0) {
    return {
      ...state,
      stock: state.waste.reverse().map(c => ({ ...c, faceUp: false })),
      waste: [],
      moves: state.moves + 1,
    };
  } else {
    const card = { ...state.stock[state.stock.length - 1], faceUp: true };
    return {
      ...state,
      stock: state.stock.slice(0, -1),
      waste: [...state.waste, card],
      moves: state.moves + 1,
    };
  }
}

export function placeOnFoundation(state: SolitaireState, foundationIdx: number): SolitaireState {
  if (!state.selected) return { ...state, selected: null };

  let card: Card | null = null;
  if (state.selected.source === 'waste' && state.waste.length > 0) {
    card = state.waste[state.waste.length - 1];
  } else if (state.selected.source === 'tableau') {
    const tab = state.tableau[state.selected.idx];
    card = tab[tab.length - 1];
  }

  if (!card || !canPlaceOnFoundation(card, state.foundations[foundationIdx])) {
    return { ...state, selected: null };
  }

  const newFoundations = state.foundations.map((f, i) =>
    i === foundationIdx ? [...f, card!] : [...f]
  );

  let newState: SolitaireState = {
    ...state,
    foundations: newFoundations,
    moves: state.moves + 1,
    selected: null,
  };

  if (state.selected.source === 'waste') {
    newState.waste = state.waste.slice(0, -1);
  } else if (state.selected.source === 'tableau') {
    const newTab = state.tableau.map((t, i) => {
      if (i === state.selected!.idx) {
        const nt = t.slice(0, -1);
        if (nt.length > 0 && !nt[nt.length - 1].faceUp) {
          nt[nt.length - 1] = { ...nt[nt.length - 1], faceUp: true };
        }
        return nt;
      }
      return t;
    });
    newState.tableau = newTab;
  }

  if (newFoundations.every(f => f.length === 13)) {
    newState.isWon = true;
  }

  return newState;
}

export function placeOnTableau(state: SolitaireState, tableauIdx: number): SolitaireState {
  if (!state.selected) {
    const tab = state.tableau[tableauIdx];
    if (tab.length > 0 && tab[tab.length - 1].faceUp) {
      return { ...state, selected: { source: 'tableau', idx: tableauIdx } };
    }
    return state;
  }

  let card: Card | null = null;
  if (state.selected.source === 'waste' && state.waste.length > 0) {
    card = state.waste[state.waste.length - 1];
  } else if (state.selected.source === 'tableau') {
    const tab = state.tableau[state.selected.idx];
    card = tab[tab.length - 1];
  }

  if (!card || !canPlaceOnTableau(card, state.tableau[tableauIdx]) ||
      (state.selected.source === 'tableau' && state.selected.idx === tableauIdx)) {
    return { ...state, selected: null };
  }

  const newTab = state.tableau.map((t, i) => {
    if (i === tableauIdx) return [...t, card!];
    if (state.selected!.source === 'tableau' && i === state.selected!.idx) {
      const nt = t.slice(0, -1);
      if (nt.length > 0 && !nt[nt.length - 1].faceUp) {
        return nt.map((c, ci) => ci === nt.length - 1 ? { ...c, faceUp: true } : c);
      }
      return nt;
    }
    return t;
  });

  let newState: SolitaireState = {
    ...state,
    tableau: newTab,
    moves: state.moves + 1,
    selected: null,
  };

  if (state.selected.source === 'waste') {
    newState.waste = state.waste.slice(0, -1);
  }

  return newState;
}

export function selectWaste(state: SolitaireState): SolitaireState {
  if (state.waste.length > 0) {
    return { ...state, selected: { source: 'waste', idx: 0 } };
  }
  return state;
}

export function resetGame(): SolitaireState {
  return createInitialState();
}

export function countFoundations(foundations: Card[][]): number {
  return foundations.reduce((sum, f) => sum + f.length, 0);
}
