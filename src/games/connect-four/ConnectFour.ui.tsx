import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import PassDeviceOverlay from '../../components/ui/PassDeviceOverlay';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import { useGridKeyNav } from '../../hooks/useGridKeyNav';
import {
  GameState,
  COLS,
  createInitialState,
  dropPiece,
  checkWin,
  isBoardFull,
  getBestMove,
} from './ConnectFour';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';

const BASE_BOT_DEPTH = 5;

export default function ConnectFour() {
  const { difficulty } = useDifficulty();
  // Deeper search = stronger bot (clamped to keep the bot's move fast).
  const botDepth = Math.min(6, Math.max(2, applyDifficulty(BASE_BOT_DEPTH, getDifficultySettings(difficulty), 'complexity')));

  const [gameState, setGameState] = useState<GameState>(() => loadSavedState<GameState>('connect-four', d => d as GameState) ?? createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('connect-four'));
  const [vsBot, setVsBot] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [awaitingPass, setAwaitingPass] = useState(false);
  const { record } = useGameResult('connect-four');
  useGameStatePersistence("connect-four", gameState, s => s, s => !s.isGameOver);
  const play = useSound();
  const { onKeyDown } = useGridKeyNav(COLS);
  const botTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const bumpHighScore = (wins: number) => {
    setHighScoreState(prev => {
      const best = Math.max(prev, wins);
      setHighScore('connect-four', best);
      return best;
    });
  };

  const onColumnClick = useCallback((col: number) => {
    if (gameState.isGameOver || awaitingPass) return;
    if (vsBot && !gameState.isPlayerTurn) return;
    if (gameState.board[0][col] !== 0) return;

    const player: 1 | 2 = vsBot ? 1 : currentPlayer;
    const newBoard = dropPiece(gameState.board, col, player);
    if (!newBoard) return;

    if (checkWin(newBoard, player)) {
      if (player === 1) {
        const newWins = gameState.wins + 1;
        bumpHighScore(newWins);
        setGameState(prev => ({ ...prev, board: newBoard, isGameOver: true, result: 'You win! 🎉', wins: newWins }));
      } else {
        setGameState(prev => ({
          ...prev,
          board: newBoard,
          isGameOver: true,
          result: vsBot ? 'Bot wins! 😢' : 'Player 2 wins! 🎉',
        }));
      }
      return;
    }

    if (isBoardFull(newBoard)) {
      setGameState(prev => ({ ...prev, board: newBoard, isGameOver: true, result: 'Draw!' }));
      return;
    }

    play('move');

    if (vsBot) {
      setGameState(prev => ({ ...prev, board: newBoard, isPlayerTurn: false }));
      botTimeoutRef.current = setTimeout(() => {
        const botCol = getBestMove(newBoard, botDepth);
        const botBoard = dropPiece(newBoard, botCol, 2);
        if (botBoard && checkWin(botBoard, 2)) {
          setGameState(prev => ({ ...prev, board: botBoard, isGameOver: true, result: 'Bot wins! 😢' }));
        } else if (botBoard && isBoardFull(botBoard)) {
          setGameState(prev => ({ ...prev, board: botBoard, isGameOver: true, result: 'Draw!' }));
        } else if (botBoard) {
          setGameState(prev => ({ ...prev, board: botBoard, isPlayerTurn: true }));
        } else {
          setGameState(prev => ({ ...prev, isPlayerTurn: true }));
        }
      }, 400);
    } else {
      const next: 1 | 2 = player === 1 ? 2 : 1;
      setGameState(prev => ({ ...prev, board: newBoard, isPlayerTurn: next === 1 }));
      setCurrentPlayer(next);
      setAwaitingPass(true);
    }
  }, [gameState, vsBot, currentPlayer, awaitingPass, botDepth]);

  useEffect(() => {
    if (gameState.isGameOver) {
      record({ won: gameState.result.includes('You win'), score: gameState.wins });
    }
  }, [gameState.isGameOver]);

  useEffect(() => () => { if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current); }, []);

  const reset = useCallback(() => {
    clearSavedState('connect-four');
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    setGameState(createInitialState());
    setCurrentPlayer(1);
    setAwaitingPass(false);
  }, []);

  const setMode = (toBot: boolean) => {
    if (botTimeoutRef.current) clearTimeout(botTimeoutRef.current);
    setVsBot(toBot);
    setCurrentPlayer(1);
    setAwaitingPass(false);
    setGameState(createInitialState());
  };

  const modeBtn = (active: boolean) =>
    `px-3 py-1 rounded-lg text-sm font-bold ${
      active ? 'bg-cyan-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
    }`;

  const currentLabel = vsBot
    ? gameState.isPlayerTurn ? 'Your turn' : 'Bot thinking…'
    : `Player ${currentPlayer}'s turn`;

  return (
    <GameLayout
      title="Connect Four"
      showDifficulty
      score={`Wins: ${gameState.wins}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setMode(true)} className={modeBtn(vsBot)}>vs Bot</button>
          <button onClick={() => setMode(false)} className={modeBtn(!vsBot)}>2 Players</button>
        </div>

        {!gameState.isGameOver && <p className="text-sm text-gray-400">{currentLabel}</p>}
        {gameState.result && <p className="text-xl font-bold text-amber-400">{gameState.result}</p>}

        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-[7/6]">
          <div className="absolute inset-0 bg-blue-800 p-2 sm:p-3 rounded-xl overflow-hidden">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 h-full" onKeyDown={onKeyDown}>
              {gameState.board.flat().map((cell, i) => (
                <button
                  key={i}
                  onClick={() => onColumnClick(i % COLS)}
                  aria-label={`Column ${(i % COLS) + 1}`}
                  className={`aspect-square rounded-full transition-all min-h-[48px] min-w-[48px] ${
                    cell === 1 ? 'bg-red-500' :
                    cell === 2 ? 'bg-yellow-400' :
                    'bg-blue-900 hover:bg-blue-950 active:bg-blue-950'
                  }`}
                  style={{ touchAction: 'manipulation' }}
                />
              ))}
            </div>
          </div>
          {!vsBot && awaitingPass && !gameState.isGameOver && (
            <PassDeviceOverlay player={currentPlayer} onReady={() => setAwaitingPass(false)} />
          )}
        </div>

        <p className="text-gray-500 text-sm">
          {vsBot ? 'You are 🔴 · Bot is 🟡' : 'Player 1 is 🔴 · Player 2 is 🟡'}
        </p>
      </div>
    </GameLayout>
  );
}
