// Pure game logic for Mancala - no React, no UI, no input handling

export type Player = 0 | 1;

export interface MancalaState {
  pits: number[];
  turn: Player;
}

export interface SowResult {
  state: MancalaState;
  extraTurn: boolean;
}

export function createInitialState(): MancalaState {
  return { pits: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0], turn: 0 };
}

export function cloneState(s: MancalaState): MancalaState {
  return { pits: [...s.pits], turn: s.turn };
}

export function sow(state: MancalaState, pit: number): SowResult {
  const s = cloneState(state);
  let stones = s.pits[pit];
  s.pits[pit] = 0;
  let idx = pit;
  while (stones > 0) {
    idx = (idx + 1) % 14;
    if (s.turn === 0 && idx === 13) continue;
    if (s.turn === 1 && idx === 6) continue;
    s.pits[idx]++;
    stones--;
  }
  const lastIdx = idx;

  // Check for capture rule
  if (s.turn === 0 && lastIdx >= 0 && lastIdx <= 5 && s.pits[lastIdx] === 1) {
    const opposite = 12 - lastIdx;
    if (s.pits[opposite] > 0) {
      s.pits[6] += s.pits[opposite] + 1;
      s.pits[lastIdx] = 0;
      s.pits[opposite] = 0;
    }
  }
  if (s.turn === 1 && lastIdx >= 7 && lastIdx <= 12 && s.pits[lastIdx] === 1) {
    const opposite = 12 - lastIdx;
    if (s.pits[opposite] > 0) {
      s.pits[13] += s.pits[opposite] + 1;
      s.pits[lastIdx] = 0;
      s.pits[opposite] = 0;
    }
  }

  // Check for extra turn (last stone in own store)
  const extraTurn = (s.turn === 0 && lastIdx === 6) || (s.turn === 1 && lastIdx === 13);

  return { state: s, extraTurn };
}

export function isGameOver(state: MancalaState): boolean {
  const p0empty = state.pits.slice(0, 6).every(v => v === 0);
  const p1empty = state.pits.slice(7, 13).every(v => v === 0);
  return p0empty || p1empty;
}

export function finalize(state: MancalaState): MancalaState {
  const s = cloneState(state);
  for (let i = 0; i < 6; i++) {
    s.pits[6] += s.pits[i];
    s.pits[i] = 0;
  }
  for (let i = 7; i < 13; i++) {
    s.pits[13] += s.pits[i];
    s.pits[i] = 0;
  }
  return s;
}

export function evaluate(state: MancalaState, player: number): number {
  const myStore = player === 1 ? 6 : 13;
  const oppStore = player === 1 ? 13 : 6;
  return state.pits[myStore] - state.pits[oppStore];
}

export function minimax(
  state: MancalaState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  player: number,
  opponent: number
): number {
  if (depth === 0 || isGameOver(state)) {
    if (isGameOver(state)) {
      const f = finalize(state);
      return f.pits[player === 1 ? 6 : 13] - f.pits[player === 1 ? 13 : 6];
    }
    return evaluate(state, player);
  }

  const currentPlayer = maximizing ? 1 : 2;
  const start = currentPlayer === 1 ? 0 : 7;
  const moves: number[] = [];
  for (let i = 0; i < 6; i++) {
    if (state.pits[start + i] > 0) moves.push(start + i);
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const pit of moves) {
      const { state: ns, extraTurn } = sow(state, pit);
      const nextMaximizing = extraTurn ? true : false;
      const eval_ = minimax(ns, depth - 1, alpha, beta, nextMaximizing, player, opponent);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const pit of moves) {
      const { state: ns, extraTurn } = sow(state, pit);
      const nextMaximizing = extraTurn ? false : true;
      const eval_ = minimax(ns, depth - 1, alpha, beta, nextMaximizing, player, opponent);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMove(state: MancalaState, depth: number = 4): number {
  const moves: number[] = [];
  for (let i = 0; i < 6; i++) {
    if (state.pits[7 + i] > 0) moves.push(7 + i);
  }
  let bestScore = -Infinity;
  let bestMove = moves[0];
  for (const pit of moves) {
    const { state: ns } = sow(state, pit);
    const score = minimax(ns, depth, -Infinity, Infinity, false, 2, 1);
    if (score > bestScore) {
      bestScore = score;
      bestMove = pit;
    }
  }
  return bestMove;
}
