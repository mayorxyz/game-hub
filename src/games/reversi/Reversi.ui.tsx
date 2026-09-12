import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import PassDeviceOverlay from '../../components/ui/PassDeviceOverlay';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import {
  BOARD_SIZE,
  Board,
  ReversiState,
  createInitialState,
  getValidMoves,
  applyMove,
  countPieces,
  getBestMove,
} from './Reversi';
import { handleCellClick } from './Reversi.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';

const BASE_BOT_DEPTH = 4;

export default function Reversi() {
  const { difficulty } = useDifficulty();
  // Deeper search = stronger bot (clamped to keep the bot's move fast).
  const botDepth = Math.min(5, Math.max(2, applyDifficulty(BASE_BOT_DEPTH, getDifficultySettings(difficulty), 'complexity')));

  const [gameState, setGameState] = useState<ReversiState>(() => loadSavedState<ReversiState>('reversi', d => d as ReversiState) ?? createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('reversi'));
  const [vsBot, setVsBot] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [awaitingPass, setAwaitingPass] = useState(false);
  const [notice, setNotice] = useState('');
  const { record } = useGameResult('reversi');
  useGameStatePersistence("reversi", gameState, s => s, s => !s.isGameOver);
  const play = useSound();

  const winsRef = useRef(gameState.wins);
  winsRef.current = gameState.wins;

  const activePlayer: 1 | 2 = vsBot ? 1 : currentPlayer;

  const bumpHighScore = (wins: number) => {
    setHighScoreState(prev => {
      const best = Math.max(prev, wins);
      setHighScore('reversi', best);
      return best;
    });
  };

  const resolveBoard = (board: Board, botMode: boolean): { over: boolean; result?: string; winner?: 1 | 2 | 'draw' } => {
    const p1 = getValidMoves(board, 1).length;
    const p2 = getValidMoves(board, 2).length;
    if (p1 > 0 || p2 > 0) return { over: false };
    const c1 = countPieces(board, 1);
    const c2 = countPieces(board, 2);
    if (c1 === c2) return { over: true, result: 'Draw!', winner: 'draw' };
    const winner: 1 | 2 = c1 > c2 ? 1 : 2;
    const result = botMode
      ? winner === 1 ? 'You win! 🎉' : 'Bot wins! 😢'
      : winner === 1 ? 'Player 1 wins! 🎉' : 'Player 2 wins! 🎉';
    return { over: true, result, winner };
  };

  const applyResult = (board: Board, res: { result?: string; winner?: 1 | 2 | 'draw' }) => {
    setGameState(prev => ({ ...prev, board, isGameOver: true, result: res.result ?? 'Game over' }));
    if (res.winner === 1) {
      const newWins = winsRef.current + 1;
      winsRef.current = newWins;
      bumpHighScore(newWins);
      setGameState(prev => ({ ...prev, wins: newWins }));
    }
  };

  const botTurn = (board: Board) => {
    const botMoves = getValidMoves(board, 2);
    if (botMoves.length === 0) {
      if (getValidMoves(board, 1).length === 0) {
        applyResult(board, resolveBoard(board, true));
      } else {
        setNotice('Bot passes');
        setGameState(prev => ({ ...prev, isPlayerTurn: true }));
      }
      return;
    }
    const [br, bc] = getBestMove(board, botDepth);
    const nb = applyMove(board, br, bc, 2);
    setGameState(prev => ({ ...prev, board: nb }));
    const res = resolveBoard(nb, true);
    if (res.over) {
      applyResult(nb, res);
      return;
    }
    if (getValidMoves(nb, 1).length === 0) {
      setNotice('No moves for you — Bot plays again');
      setTimeout(() => botTurn(nb), 450);
    } else {
      setGameState(prev => ({ ...prev, isPlayerTurn: true }));
    }
  };

  const onMove = useCallback((r: number, c: number) => {
    if (gameState.isGameOver || awaitingPass) return;

    const player = activePlayer;
    const nb = applyMove(gameState.board, r, c, player);
    play('move');

    const res = resolveBoard(nb, vsBot);
    if (res.over) {
      setGameState(prev => ({ ...prev, board: nb }));
      applyResult(nb, res);
      return;
    }

    if (vsBot) {
      setNotice('');
      setGameState(prev => ({ ...prev, board: nb, isPlayerTurn: false }));
      setTimeout(() => botTurn(nb), 400);
    } else {
      let next: 1 | 2 = player === 1 ? 2 : 1;
      let passNote = '';
      if (getValidMoves(nb, next).length === 0 && getValidMoves(nb, player).length > 0) {
        passNote = `Player ${next} has no moves`;
        next = player;
      }
      setNotice(passNote);
      setCurrentPlayer(next);
      setGameState(prev => ({ ...prev, board: nb }));
      setAwaitingPass(true);
    }
  }, [gameState, vsBot, activePlayer, awaitingPass]);

  const onCellClick = (r: number, c: number) => {
    handleCellClick(
      gameState.board,
      r,
      c,
      vsBot ? gameState.isPlayerTurn : true,
      gameState.isGameOver || awaitingPass,
      onMove,
      activePlayer
    );
  };

  const validMoves = !awaitingPass ? getValidMoves(gameState.board, activePlayer) : [];

  useEffect(() => {
    if (gameState.isGameOver) {
      record({ won: gameState.result.includes('You win'), score: gameState.wins });
    }
  }, [gameState.isGameOver]);

  const reset = () => {
    clearSavedState('reversi');
    setGameState(createInitialState());
    setCurrentPlayer(1);
    setAwaitingPass(false);
    setNotice('');
  };

  const setMode = (toBot: boolean) => {
    setVsBot(toBot);
    setCurrentPlayer(1);
    setAwaitingPass(false);
    setNotice('');
    setGameState(createInitialState());
  };

  const modeBtn = (active: boolean) =>
    `px-3 py-1 rounded-lg text-sm font-bold ${
      active ? 'bg-cyan-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
    }`;

  return (
    <GameLayout
      title="Reversi"
      showDifficulty
      score={`⬛ ${countPieces(gameState.board, 1)} · ⬜ ${countPieces(gameState.board, 2)}`}
      highScore={highScore}
      onReset={reset}
    >
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
        {notice && !gameState.isGameOver && <p className="text-xs text-amber-400">{notice}</p>}
        {gameState.result && <p className="text-xl font-bold text-amber-400">{gameState.result}</p>}

        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 bg-green-800 p-2 rounded-xl overflow-hidden">
            <div
              className="grid gap-[1px] h-full"
              style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
              }}
            >
              {gameState.board.flat().map((cell, i) => {
                const r = Math.floor(i / BOARD_SIZE);
                const c = i % BOARD_SIZE;
                const isValid = validMoves.some(([vr, vc]) => vr === r && vc === c);
                return (
                  <button
                    key={i}
                    onClick={() => onCellClick(r, c)}
                    aria-label={`Row ${r + 1}, column ${c + 1}`}
                    className={`flex items-center justify-center rounded-sm min-h-[48px] min-w-[48px] ${
                      isValid ? 'bg-green-600 hover:bg-green-500 active:bg-green-500' : 'bg-green-700'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {cell === 1 && <div className="w-3/4 h-3/4 rounded-full bg-gray-900" />}
                    {cell === 2 && <div className="w-3/4 h-3/4 rounded-full bg-white" />}
                  </button>
                );
              })}
            </div>
          </div>
          {!vsBot && awaitingPass && !gameState.isGameOver && (
            <PassDeviceOverlay player={currentPlayer} onReady={() => setAwaitingPass(false)} />
          )}
        </div>

        <p className="text-gray-500 text-xs">
          {vsBot ? 'You are ⬛ · Bot is ⬜' : 'Player 1 is ⬛ · Player 2 is ⬜'}
        </p>
      </div>
    </GameLayout>
  );
}
