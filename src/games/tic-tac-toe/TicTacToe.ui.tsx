import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import { useGridKeyNav } from '../../hooks/useGridKeyNav';
import {
  Board,
  GameState,
  createInitialState,
  checkWinner,
  isBoardFull,
  getBestMove,
  makeMove,
} from './TicTacToe';
import { handleCellClick } from './TicTacToe.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import type { Difficulty } from '../../lib/difficulty';

// How often the bot plays a random move instead of the perfect one.
const MISTAKE_CHANCE: Record<Difficulty, number> = { easy: 0.6, medium: 0, hard: 0 };

export default function TicTacToe() {
  const { difficulty } = useDifficulty();
  const mistakeChance = MISTAKE_CHANCE[difficulty];
  // On hard the bot takes the first move, so perfect play is no longer enough for a draw.
  const botStarts = difficulty === 'hard';

  const newGame = useCallback(() => {
    const state = createInitialState();
    if (!botStarts) return state;
    return { ...state, board: makeMove(state.board, getBestMove(state.board), 'O') };
  }, [botStarts]);

  const [gameState, setGameState] = useState<GameState>(() => loadSavedState<GameState>('tic-tac-toe', d => d as GameState) ?? newGame());
  const [highScore, setHighScoreState] = useState(getHighScore('tic-tac-toe'));
  const { record } = useGameResult('tic-tac-toe');
  useGameStatePersistence("tic-tac-toe", gameState, s => s, s => !s.isGameOver);
  const play = useSound();
  const { onKeyDown } = useGridKeyNav(3);
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Handle player move
  const onPlayerMove = useCallback((idx: number) => {
    const newBoard = makeMove(gameState.board, idx, 'X');
    setGameState(prev => ({ ...prev, board: newBoard }));

    const winner = checkWinner(newBoard);
    if (winner) {
      const newWins = gameState.wins + 1;
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        result: 'You win! 🎉',
        wins: newWins,
      }));
      setHighScoreState(prev => {
        const best = Math.max(prev, newWins);
        setHighScore('tic-tac-toe', best);
        return best;
      });
      return;
    }

    if (isBoardFull(newBoard)) {
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        result: 'Draw!',
      }));
      return;
    }

    setGameState(prev => ({ ...prev, isPlayerTurn: false }));

    // Bot move
    botTimeoutRef.current = setTimeout(() => {
      const botMove = getBestMove(newBoard, mistakeChance);
      const botBoard = makeMove(newBoard, botMove, 'O');
      setGameState(prev => ({ ...prev, board: botBoard }));

      const botWinner = checkWinner(botBoard);
      if (botWinner) {
        setGameState(prev => ({
          ...prev,
          isGameOver: true,
          result: 'Bot wins! 🤖',
        }));
      } else if (isBoardFull(botBoard)) {
        setGameState(prev => ({
          ...prev,
          isGameOver: true,
          result: 'Draw!',
        }));
      }
      setGameState(prev => ({ ...prev, isPlayerTurn: true }));
    }, 300);
  }, [gameState.board, gameState.wins, mistakeChance]);

  const onCellClick = useCallback((idx: number) => {
    play('click');
    handleCellClick(
      gameState.board,
      idx,
      gameState.isGameOver,
      gameState.isPlayerTurn,
      onPlayerMove
    );
  }, [gameState.board, gameState.isGameOver, gameState.isPlayerTurn, onPlayerMove]);

    useEffect(() => {
    if (gameState.isGameOver) {
      record({ won: (gameState.result || '').includes('You win'), score: gameState.wins });
    }
  }, [gameState.isGameOver]);

  const reset = useCallback(() => {
    clearSavedState('tic-tac-toe');
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
    }
    setGameState(newGame());
  }, [newGame]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
      }
    };
  }, []);

  return (
    <GameLayout
      title="Tic-Tac-Toe"
      showDifficulty
      score={`Wins: ${gameState.wins}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.result && (
          <p className="text-xl font-bold text-amber-400">{gameState.result}</p>
        )}
        
        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 grid grid-cols-3 gap-2" onKeyDown={onKeyDown}>
            {gameState.board.map((cell, i) => (
              <button
                key={i}
                onClick={() => onCellClick(i)}
                className={`rounded-xl text-3xl sm:text-4xl font-bold flex items-center justify-center transition-all min-h-[48px] min-w-[48px] ${
                  cell === 'X' ? 'bg-blue-600 text-white' :
                  cell === 'O' ? 'bg-red-600 text-white' :
                  'bg-gray-700 hover:bg-gray-600 active:bg-gray-500'
                }`}
                style={{ touchAction: 'manipulation' }}
              >
                {cell}
              </button>
            ))}
          </div>
        </div>
        
        <p className="text-gray-500 text-sm">
          You are X · {botStarts ? 'Bot moves first' : mistakeChance > 0 ? 'Bot makes mistakes' : 'Bot is unbeatable'}
        </p>
      </div>
    </GameLayout>
  );
}
