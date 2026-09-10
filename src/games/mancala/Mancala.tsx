import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

type State = { pits: number[]; turn: 0 | 1 };

function initState(): State {
  return { pits: [4,4,4,4,4,4,0,4,4,4,4,4,4,0], turn: 0 };
}

function cloneState(s: State): State {
  return { pits: [...s.pits], turn: s.turn };
}

function sow(state: State, pit: number): State {
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
  return s;
}

function isGameOver(state: State): boolean {
  const p0empty = state.pits.slice(0, 6).every(v => v === 0);
  const p1empty = state.pits.slice(7, 13).every(v => v === 0);
  return p0empty || p1empty;
}

function finalize(state: State): State {
  const s = cloneState(state);
  for (let i = 0; i < 6; i++) { s.pits[6] += s.pits[i]; s.pits[i] = 0; }
  for (let i = 7; i < 13; i++) { s.pits[13] += s.pits[i]; s.pits[i] = 0; }
  return s;
}

function evaluate(state: State, player: number): number {
  const myStore = player === 1 ? 6 : 13;
  const oppStore = player === 1 ? 13 : 6;
  return state.pits[myStore] - state.pits[oppStore];
}

function minimax(state: State, depth: number, alpha: number, beta: number, maximizing: boolean, player: number, opponent: number): number {
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
      const ns = sow(state, pit);
      ns.turn = 0;
      const eval_ = minimax(ns, depth - 1, alpha, beta, false, player, opponent);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const pit of moves) {
      const ns = sow(state, pit);
      ns.turn = 1;
      const eval_ = minimax(ns, depth - 1, alpha, beta, true, player, opponent);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function getBestMove(state: State): number {
  const moves: number[] = [];
  for (let i = 0; i < 6; i++) {
    if (state.pits[7 + i] > 0) moves.push(7 + i);
  }
  let bestScore = -Infinity;
  let bestMove = moves[0];
  for (const pit of moves) {
    const ns = sow(state, pit);
    ns.turn = 1;
    const score = minimax(ns, 4, -Infinity, Infinity, true, 2, 1);
    if (score > bestScore) {
      bestScore = score;
      bestMove = pit;
    }
  }
  return bestMove;
}

export default function Mancala() {
  const [state, setState] = useState<State>(initState);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');
  const [wins, setWins] = useState(0);
  const [highScore, setHS] = useState(getHighScore('mancala'));

  const handleClick = (pit: number) => {
    if (gameOver || !isPlayerTurn) return;
    if (pit < 0 || pit > 5 || state.pits[pit] === 0) return;

    let ns = sow(state, pit);
    ns.turn = 0;
    setState(ns);

    if (isGameOver(ns)) {
      const f = finalize(ns);
      setState(f);
      setGameOver(true);
      setResult(f.pits[6] > f.pits[13] ? 'You win! 🎉' : f.pits[6] < f.pits[13] ? 'Bot wins!' : 'Draw!');
      if (f.pits[6] > f.pits[13]) {
        setWins(w => {
          const nw = w + 1;
          setHS(h => {
            const best = Math.max(h, nw);
            setHighScore('mancala', best);
            return best;
          });
          return nw;
        });
      }
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(() => {
      const move = getBestMove(ns);
      let ns2 = sow(ns, move);
      ns2.turn = 1;
      setState(ns2);
      if (isGameOver(ns2)) {
        const f = finalize(ns2);
        setState(f);
        setGameOver(true);
        setResult(f.pits[6] > f.pits[13] ? 'You win! 🎉' : f.pits[6] < f.pits[13] ? 'Bot wins!' : 'Draw!');
        if (f.pits[6] > f.pits[13]) {
          setWins(w => {
            const nw = w + 1;
            setHS(h => {
              const best = Math.max(h, nw);
              setHighScore('mancala', best);
              return best;
            });
            return nw;
          });
        }
      }
      setIsPlayerTurn(true);
    }, 500);
  };

  const reset = () => {
    setState(initState());
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult('');
  };

  return (
    <GameLayout title="Mancala" score={`You: ${state.pits[6]} · Bot: ${state.pits[13]}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center gap-4">
        {result && <p className="text-xl font-bold text-amber-400">{result}</p>}
        <div className="bg-amber-900 p-4 rounded-2xl flex gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              {[12,11,10,9,8,7].map(i => (
                <div key={i} className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-800 rounded-full flex items-center justify-center text-sm font-bold text-white">
                  {state.pits[i]}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="w-10 h-24 sm:w-12 sm:h-28 bg-amber-700 rounded-full flex items-center justify-center text-sm font-bold text-white">{state.pits[13]}</div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="w-10 h-24 sm:w-12 sm:h-28 bg-amber-700 rounded-full flex items-center justify-center text-sm font-bold text-white">{state.pits[6]}</div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              {[0,1,2,3,4,5].map(i => (
                <button
                  key={i}
                  onClick={() => handleClick(i)}
                  disabled={!isPlayerTurn || state.pits[i] === 0}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-800 hover:bg-amber-600 rounded-full flex items-center justify-center text-sm font-bold text-white disabled:opacity-50"
                >
                  {state.pits[i]}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-gray-500 text-xs">Your pits are on the bottom</p>
      </div>
    </GameLayout>
  );
}
