import React, { useState, useCallback, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import PassDeviceOverlay from '../../components/ui/PassDeviceOverlay';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import {
  BOARD_SIZE,
  Move,
  Board,
  GameState,
  createInitialState,
  applyMove,
  getAllMoves,
  botMove,
} from './Checkers';
import { handleCellClick } from './Checkers.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings } from '../../lib/difficulty';

export default function Checkers() {
  const { difficulty } = useDifficulty();
  // 0 = random moves, 1 = always plays the strongest move.
  const botSkill = Math.min(1, getDifficultySettings(difficulty).complexityMultiplier * 0.7);

  const [gameState, setGameState] = useState<GameState>(() => loadSavedState<GameState>('checkers', d => d as GameState) ?? createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('checkers'));
  const [vsBot, setVsBot] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [awaitingPass, setAwaitingPass] = useState(false);
  const { record } = useGameResult('checkers');
  useGameStatePersistence("checkers", gameState, s => s, s => !s.isGameOver);
  const play = useSound();

  const activePlayer: 1 | 2 = vsBot ? 1 : currentPlayer;

  const bumpHighScore = (wins: number) => {
    setHighScoreState(prev => {
      const best = Math.max(prev, wins);
      setHighScore('checkers', best);
      return best;
    });
  };

  const resolveResult = (board: Board): { over: boolean; result?: string; winner?: 1 | 2 | 'draw' } => {
    const p1 = getAllMoves(board, 1).length;
    const p2 = getAllMoves(board, 2).length;
    if (p1 === 0 && p2 === 0) return { over: true, result: 'Draw!', winner: 'draw' };
    if (p2 === 0) return { over: true, result: vsBot ? 'You win! 🎉' : 'Player 1 wins! 🎉', winner: 1 };
    if (p1 === 0) return { over: true, result: vsBot ? 'Bot wins! 😢' : 'Player 2 wins! 🎉', winner: 2 };
    return { over: false };
  };

  const applyResult = (board: Board, res: { result?: string; winner?: 1 | 2 | 'draw' }) => {
    setGameState(prev => ({ ...prev, board, isGameOver: true, result: res.result ?? 'Game over', selected: null }));
    if (res.winner === 1) {
      const newWins = gameState.wins + 1;
      bumpHighScore(newWins);
      setGameState(prev => ({ ...prev, wins: newWins }));
    }
  };

  const onMove = useCallback((move: Move) => {
    if (gameState.isGameOver || awaitingPass) return;

    const player = activePlayer;
    const newBoard = applyMove(gameState.board, move.from, move.to, move.captures);
    play('move');

    const res = resolveResult(newBoard);
    if (res.over) {
      setGameState(prev => ({ ...prev, board: newBoard, selected: null }));
      applyResult(newBoard, res);
      return;
    }

    if (vsBot) {
      setGameState(prev => ({ ...prev, board: newBoard, selected: null, isPlayerTurn: false }));
      setTimeout(() => {
        const bm = botMove(newBoard, botSkill);
        if (bm) {
          const nb2 = applyMove(newBoard, bm.from, bm.to, bm.captures);
          const res2 = resolveResult(nb2);
          setGameState(prev => ({ ...prev, board: nb2, selected: null }));
          if (res2.over) {
            applyResult(nb2, res2);
          } else {
            setGameState(prev => ({ ...prev, isPlayerTurn: true }));
          }
        } else {
          const newWins = gameState.wins + 1;
          bumpHighScore(newWins);
          setGameState(prev => ({ ...prev, board: newBoard, isGameOver: true, result: 'You win! 🎉', wins: newWins }));
        }
      }, 500);
    } else {
      const next: 1 | 2 = player === 1 ? 2 : 1;
      setGameState(prev => ({ ...prev, board: newBoard, selected: null }));
      setCurrentPlayer(next);
      setAwaitingPass(true);
    }
  }, [gameState, vsBot, activePlayer, awaitingPass, botSkill]);

  const onSelect = useCallback((pos: [number, number] | null) => {
    setGameState(prev => ({ ...prev, selected: pos }));
  }, []);

  const onCellClick = useCallback((r: number, c: number) => {
    handleCellClick(
      gameState.board,
      r,
      c,
      gameState.isGameOver || awaitingPass,
      vsBot ? gameState.isPlayerTurn : true,
      gameState.selected,
      onSelect,
      onMove,
      activePlayer
    );
  }, [gameState.board, gameState.isGameOver, gameState.isPlayerTurn, gameState.selected, onSelect, onMove, activePlayer, vsBot, awaitingPass]);

  const validMoves = gameState.selected
    ? getAllMoves(gameState.board, activePlayer).filter(
        m => m.from[0] === gameState.selected![0] && m.from[1] === gameState.selected![1]
      )
    : [];

  useEffect(() => {
    if (gameState.isGameOver) {
      record({ won: gameState.result.includes('You win'), score: gameState.wins });
    }
  }, [gameState.isGameOver]);

  const reset = useCallback(() => {
    clearSavedState('checkers');
    setGameState(createInitialState());
    setCurrentPlayer(1);
    setAwaitingPass(false);
  }, []);

  const setMode = (toBot: boolean) => {
    setVsBot(toBot);
    setCurrentPlayer(1);
    setAwaitingPass(false);
    setGameState(createInitialState());
  };

  const modeBtn = (active: boolean) =>
    `px-3 py-1 rounded-lg text-sm font-bold ${
      active ? 'bg-cyan-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
    }`;

  return (
    <GameLayout title="Checkers" showDifficulty score={`Wins: ${gameState.wins}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center justify-center w-full h-full gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setMode(true)} className={modeBtn(vsBot)}>vs Bot</button>
          <button onClick={() => setMode(false)} className={modeBtn(!vsBot)}>2 Players</button>
        </div>

        {!gameState.isGameOver && (
          <p className="text-sm text-gray-400">
            {vsBot ? (gameState.isPlayerTurn ? 'Your turn' : 'Bot thinking…') : `Player ${currentPlayer}'s turn`}
          </p>
        )}
        {gameState.result && <p className="text-xl font-bold text-amber-400">{gameState.result}</p>}

        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div
            className="absolute inset-0 grid gap-0 border-2 border-gray-600 rounded overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
            }}
          >
            {gameState.board.flat().map((piece, i) => {
              const r = Math.floor(i / BOARD_SIZE);
              const c = i % BOARD_SIZE;
              const isDark = (r + c) % 2 === 1;
              const isSelected = gameState.selected && gameState.selected[0] === r && gameState.selected[1] === c;
              const isValidTarget = validMoves.some(m => m.to[0] === r && m.to[1] === c);
              return (
                <button
                  key={i}
                  onClick={() => onCellClick(r, c)}
                  aria-label={`Row ${r + 1}, column ${c + 1}`}
                  className={`flex items-center justify-center min-h-[48px] min-w-[48px] ${
                    isDark ? 'bg-green-800' : 'bg-amber-100'
                  } ${isValidTarget ? 'ring-2 ring-yellow-400' : ''} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {piece && (
                    <div
                      className={`w-3/4 h-3/4 rounded-full flex items-center justify-center text-xs font-bold ${
                        piece.player === 1 ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'
                      }`}
                    >
                      {piece.king ? '♛' : ''}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {!vsBot && awaitingPass && !gameState.isGameOver && (
            <PassDeviceOverlay player={currentPlayer} onReady={() => setAwaitingPass(false)} />
          )}
        </div>

        <p className="text-gray-500 text-xs">
          {vsBot ? 'You are red · Bot is black' : 'Player 1 is red · Player 2 is black'}
        </p>
      </div>
    </GameLayout>
  );
}
