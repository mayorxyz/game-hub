import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import {
  MancalaState,
  createInitialState,
  sow,
  isGameOver,
  finalize,
  getBestMove,
} from './Mancala';
import { handlePitClick } from './Mancala.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';

const BASE_BOT_DEPTH = 4;

export default function Mancala() {
  const { difficulty } = useDifficulty();
  // Deeper search = stronger bot (clamped to keep the bot's move fast).
  const botDepth = Math.min(5, Math.max(2, applyDifficulty(BASE_BOT_DEPTH, getDifficultySettings(difficulty), 'complexity')));

  const [state, setState] = useState<MancalaState>(() => loadSavedState<MancalaState>('mancala', d => d as MancalaState) ?? createInitialState());
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const gameOverRef = useRef(false);
  gameOverRef.current = gameOver;
  const [result, setResult] = useState('');
  const [wins, setWins] = useState(0);
  const [highScore, setHighScoreState] = useState(getHighScore('mancala'));
  const { record } = useGameResult('mancala');
  useGameStatePersistence('mancala', state, s => s, () => !gameOverRef.current);
  const play = useSound();

  const onMove = useCallback((newState: MancalaState, extraTurn: boolean) => {
    setState(newState);

    if (isGameOver(newState)) {
      const f = finalize(newState);
      setState(f);
      setGameOver(true);
      setResult(f.pits[6] > f.pits[13] ? 'You win! 🎉' : f.pits[6] < f.pits[13] ? 'Bot wins!' : 'Draw!');
      if (f.pits[6] > f.pits[13]) {
        const newWins = wins + 1;
        setWins(newWins);
        setHighScoreState(prev => {
          const best = Math.max(prev, newWins);
          setHighScore('mancala', best);
          return best;
        });
      }
      return;
    }

    if (extraTurn) {
      return;
    }

    setIsPlayerTurn(false);
    setTimeout(() => {
      const move = getBestMove(newState, botDepth);
      const { state: ns2, extraTurn: botExtraTurn } = sow(newState, move);
      setState(ns2);
      if (isGameOver(ns2)) {
        const f = finalize(ns2);
        setState(f);
        setGameOver(true);
        setResult(f.pits[6] > f.pits[13] ? 'You win! 🎉' : f.pits[6] < f.pits[13] ? 'Bot wins!' : 'Draw!');
        if (f.pits[6] > f.pits[13]) {
          const newWins = wins + 1;
          setWins(newWins);
          setHighScoreState(prev => {
            const best = Math.max(prev, newWins);
            setHighScore('mancala', best);
            return best;
          });
        }
        return;
      }
      if (botExtraTurn) {
        setTimeout(() => {
          const move2 = getBestMove(ns2, botDepth);
          const { state: ns3 } = sow(ns2, move2);
          setState(ns3);
          if (isGameOver(ns3)) {
            const f = finalize(ns3);
            setState(f);
            setGameOver(true);
            setResult(f.pits[6] > f.pits[13] ? 'You win! 🎉' : f.pits[6] < f.pits[13] ? 'Bot wins!' : 'Draw!');
            if (f.pits[6] > f.pits[13]) {
              const newWins = wins + 1;
              setWins(newWins);
              setHighScoreState(prev => {
                const best = Math.max(prev, newWins);
                setHighScore('mancala', best);
                return best;
              });
            }
            return;
          }
          setIsPlayerTurn(true);
        }, 500);
      } else {
        setIsPlayerTurn(true);
      }
    }, 500);
  }, [wins, botDepth]);

  const onPitClick = useCallback((pit: number) => {
    play('move');
    handlePitClick(state, pit, isPlayerTurn, gameOver, onMove);
  }, [state, isPlayerTurn, gameOver, onMove]);

    useEffect(() => {
    if (gameOver) {
      record({ won: result.includes('You win'), score: wins });
    }
  }, [gameOver]);

  const onReset = useCallback(() => {
    clearSavedState('mancala');
    setState(createInitialState());
    setIsPlayerTurn(true);
    setGameOver(false);
    setResult('');
  }, []);

  return (
    <GameLayout
      title="Mancala"
      showDifficulty
      score={`You: ${state.pits[6]} · Bot: ${state.pits[13]}`}
      highScore={highScore}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        {result && <p className="text-xl font-bold text-amber-400">{result}</p>}
        <div className="bg-amber-900 p-4 rounded-2xl flex gap-2 overflow-auto">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              {[12, 11, 10, 9, 8, 7].map(i => (
                <div
                  key={i}
                  className="min-w-[48px] min-h-[48px] w-10 h-10 sm:w-12 sm:h-12 bg-amber-800 rounded-full flex items-center justify-center text-sm font-bold text-white"
                >
                  {state.pits[i]}
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="min-w-[48px] w-10 h-24 sm:w-12 sm:h-28 bg-amber-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
              {state.pits[13]}
            </div>
          </div>
          <div className="flex flex-col justify-between">
            <div className="min-w-[48px] w-10 h-24 sm:w-12 sm:h-28 bg-amber-700 rounded-full flex items-center justify-center text-sm font-bold text-white">
              {state.pits[6]}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => onPitClick(i)}
                  disabled={!isPlayerTurn || state.pits[i] === 0}
                  className="min-w-[48px] min-h-[48px] w-10 h-10 sm:w-12 sm:h-12 bg-amber-800 hover:bg-amber-600 active:bg-amber-500 rounded-full flex items-center justify-center text-sm font-bold text-white disabled:opacity-50"
                  style={{ touchAction: 'manipulation' }}
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
