import React, { useState, useCallback, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import PassDeviceOverlay from '../../components/ui/PassDeviceOverlay';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import { useSound } from '../../hooks/useSound';
import {
  GameState,
  Board,
  GRID_SIZE,
  SHIPS,
  createInitialState,
  countHits,
  attackBoard,
  botGuess,
  getFleet,
  totalShipCells,
} from './Battleship';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';
import DifficultySelector from '../../components/ui/DifficultySelector';

export default function Battleship() {
  const { difficulty, setDifficulty } = useDifficulty();
  const difficultySettings = getDifficultySettings(difficulty);
  const shipCount = Math.min(6, Math.max(3, applyDifficulty(SHIPS.length, difficultySettings, 'complexity')));
  const fleet = getFleet(shipCount);
  const totalCells = totalShipCells(fleet);

  const [gameState, setGameState] = useState<GameState>(() => loadSavedState<GameState>('battleship', d => d as GameState) ?? createInitialState(fleet));
  const [highScore, setHighScoreState] = useState(getHighScore('battleship'));
  const [vsBot, setVsBot] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<1 | 2>(1);
  const [awaitingPass, setAwaitingPass] = useState(false);
  const { record } = useGameResult('battleship');
  useGameStatePersistence("battleship", gameState, s => s, s => !s.isGameOver);
  const play = useSound();

  const playerHitsOnBot = countHits(gameState.botBoard);
  const botHitsOnPlayer = countHits(gameState.playerBoard);

  const bumpHighScore = () => {
    setHighScoreState(prev => {
      const best = Math.max(prev, 1000);
      setHighScore('battleship', best);
      return best;
    });
  };

  const fire = useCallback((r: number, c: number) => {
    if (gameState.isGameOver || awaitingPass) return;

    if (vsBot) {
      if (!gameState.isPlayerTurn) return;
      if (gameState.botBoard[r][c] !== 'empty') return;

      const { newBoard, isHit } = attackBoard(gameState.botBoard, gameState.botShips, r, c);
      play(isHit ? 'success' : 'click');

      if (countHits(newBoard) >= totalCells) {
        setGameState(prev => ({ ...prev, botBoard: newBoard, isGameOver: true, result: 'You win! 🎉' }));
        bumpHighScore();
        return;
      }

      setGameState(prev => ({ ...prev, botBoard: newBoard, isPlayerTurn: false }));

      setTimeout(() => {
        setGameState(prev => {
          const [br, bc] = botGuess(prev.playerBoard, fleet);
          const { newBoard: pb } = attackBoard(prev.playerBoard, prev.playerShips, br, bc);
          if (countHits(pb) >= totalCells) {
            return { ...prev, playerBoard: pb, isGameOver: true, result: 'Bot wins! 😢' };
          }
          return { ...prev, playerBoard: pb, isPlayerTurn: true };
        });
      }, 500);
      return;
    }

    // Hotseat: the current player fires at the other player's fleet.
    const isP1 = currentPlayer === 1;
    const board = isP1 ? gameState.botBoard : gameState.playerBoard;
    const ships = isP1 ? gameState.botShips : gameState.playerShips;
    if (board[r][c] !== 'empty') return;

    const { newBoard, isHit } = attackBoard(board, ships, r, c);
    play(isHit ? 'success' : 'click');

    const withBoard = {
      ...gameState,
      botBoard: isP1 ? newBoard : gameState.botBoard,
      playerBoard: isP1 ? gameState.playerBoard : newBoard,
    };

    if (countHits(newBoard) >= totalCells) {
      setGameState({
        ...withBoard,
        isGameOver: true,
        result: isP1 ? 'Player 1 wins! 🎉' : 'Player 2 wins! 🎉',
      });
      return;
    }

    setGameState(withBoard);
    setCurrentPlayer(isP1 ? 2 : 1);
    setAwaitingPass(true);
  }, [gameState, vsBot, currentPlayer, awaitingPass, totalCells, fleet]);

  useEffect(() => {
    if (gameState.isGameOver) {
      const won = gameState.result.startsWith('You win') || gameState.result.startsWith('Player 1');
      record({ won, score: 0 });
    }
  }, [gameState.isGameOver]);

  const reset = useCallback(() => {
    clearSavedState('battleship');
    setGameState(createInitialState(fleet));
    setCurrentPlayer(1);
    setAwaitingPass(false);
  }, [fleet]);

  const setMode = (toBot: boolean) => {
    setVsBot(toBot);
    setCurrentPlayer(1);
    setAwaitingPass(false);
    setGameState(createInitialState(fleet));
  };

  const modeBtn = (active: boolean) =>
    `px-3 py-1 rounded-lg text-sm font-bold ${
      active ? 'bg-cyan-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
    }`;

  const myWaters: Board = vsBot
    ? gameState.playerBoard
    : currentPlayer === 1 ? gameState.playerBoard : gameState.botBoard;
  const enemyWaters: Board = vsBot
    ? gameState.botBoard
    : currentPlayer === 1 ? gameState.botBoard : gameState.playerBoard;
  const myLabel = vsBot ? 'Your Waters (Bot\u2019s attacks)' : `Player ${currentPlayer}'s Waters`;
  const enemyLabel = vsBot ? 'Enemy Waters (Your attacks)' : 'Enemy Waters (fire here)';
  const canFire = (vsBot ? gameState.isPlayerTurn : !awaitingPass) && !gameState.isGameOver;

  const renderGrid = (board: Board, clickable: boolean) => (
    <div className="relative aspect-square">
      <div
        className="absolute inset-0 grid gap-[1px] bg-gray-700 p-1 rounded overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
        }}
      >
        {board.flat().map((cell, i) => {
          const r = Math.floor(i / GRID_SIZE);
          const c = i % GRID_SIZE;
          const inner = (
            <span className="text-[10px] leading-none">
              {cell === 'hit' ? '💥' : cell === 'miss' ? '·' : ''}
            </span>
          );
          if (!clickable) {
            return (
              <div
                key={i}
                className={`flex items-center justify-center rounded-sm min-h-[32px] min-w-[32px] ${
                  cell === 'hit' ? 'bg-red-600' : cell === 'miss' ? 'bg-blue-900' : 'bg-gray-800'
                }`}
              >
                {inner}
              </div>
            );
          }
          return (
            <button
              key={i}
              onClick={() => fire(r, c)}
              disabled={cell !== 'empty' || !canFire}
              aria-label={`Fire at row ${r + 1}, column ${c + 1}`}
              className={`flex items-center justify-center rounded-sm transition-colors min-h-[32px] min-w-[32px] ${
                cell === 'hit'
                  ? 'bg-red-600'
                  : cell === 'miss'
                  ? 'bg-blue-900'
                  : canFire
                  ? 'bg-gray-800 hover:bg-gray-600 cursor-pointer'
                  : 'bg-gray-800 cursor-not-allowed'
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <GameLayout
      title="Battleship"
      score={`Your hits: ${playerHitsOnBot}/${totalCells}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-3">
        <div className="flex items-center gap-2">
          <button onClick={() => setMode(true)} className={modeBtn(vsBot)}>vs Bot</button>
          <button onClick={() => setMode(false)} className={modeBtn(!vsBot)}>2 Players</button>
        </div>

        <DifficultySelector
          value={difficulty}
          onChange={(newDifficulty) => {
            setDifficulty(newDifficulty);
            // Fleet size is baked into the board, so restart with the new fleet.
            const newSettings = getDifficultySettings(newDifficulty);
            const newShipCount = Math.min(6, Math.max(3, applyDifficulty(SHIPS.length, newSettings, 'complexity')));
            setGameState(createInitialState(getFleet(newShipCount)));
            setCurrentPlayer(1);
            setAwaitingPass(false);
          }}
        />

        {gameState.result && <p className="text-xl font-bold text-amber-400">{gameState.result}</p>}

        <div className="w-full max-w-[min(90vw,40vh)]">
          <p className="text-gray-400 text-sm mb-1 text-center">{myLabel}</p>
          {renderGrid(myWaters, false)}
        </div>

        <div className="relative w-full max-w-[min(90vw,40vh)]">
          <p className="text-gray-400 text-sm mb-1 text-center">{enemyLabel}</p>
          {renderGrid(enemyWaters, true)}
          {!vsBot && awaitingPass && !gameState.isGameOver && (
            <div className="absolute inset-x-0 top-6 bottom-0">
              <PassDeviceOverlay player={currentPlayer} onReady={() => setAwaitingPass(false)} />
            </div>
          )}
        </div>

        <p className="text-gray-500 text-xs">
          {gameState.isGameOver
            ? 'Game over'
            : vsBot
              ? gameState.isPlayerTurn ? 'Your turn — tap enemy waters to fire' : 'Bot is thinking…'
              : awaitingPass ? 'Pass the device' : `Player ${currentPlayer} — tap enemy waters to fire`}
        </p>
        {!vsBot && (
          <p className="text-gray-500 text-xs">
            P1 hits: {playerHitsOnBot}/{totalCells} · P2 hits: {botHitsOnPlayer}/{totalCells}
          </p>
        )}
      </div>
    </GameLayout>
  );
}
