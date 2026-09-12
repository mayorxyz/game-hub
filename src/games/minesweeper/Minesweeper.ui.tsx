import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import { useSound } from '../../hooks/useSound';
import { useGridKeyNav } from '../../hooks/useGridKeyNav';
import { useGameResult } from '../../hooks/useGameResult';
import { useGameStatePersistence, loadSavedState, clearSavedState } from '../../hooks/useGameStatePersistence';
import {
  Board,
  BASE_ROWS,
  BASE_COLS,
  BASE_MINES,
  MinesweeperState,
  createBoard,
  createInitialState,
  resetGame,
} from './Minesweeper';
import { handleCellClick, handleContextMenu } from './Minesweeper.controls';
import { useDifficulty } from '../../hooks/useDifficulty';
import { getDifficultySettings, applyDifficulty } from '../../lib/difficulty';
import DifficultySelector from '../../components/ui/DifficultySelector';

export default function Minesweeper({ daily = false, dailySeed }: { daily?: boolean; dailySeed?: number }) {
  const { difficulty, setDifficulty } = useDifficulty();
  const difficultySettings = getDifficultySettings(difficulty);
  
  const rows = applyDifficulty(BASE_ROWS, difficultySettings, 'size');
  const cols = applyDifficulty(BASE_COLS, difficultySettings, 'size');
  const mines = applyDifficulty(BASE_MINES, difficultySettings, 'complexity');
  
  const [gameState, setGameState] = useState<MinesweeperState>(() => (!daily ? loadSavedState<MinesweeperState>('minesweeper', d => d as MinesweeperState) : null) ?? ({
    board: createBoard(rows, cols, mines, daily ? dailySeed : undefined),
    isOver: false,
    isWon: false,
    time: 0,
    isRunning: false,
    flagMode: false,
  }));
  const [bestTime, setBestTime] = useState(getHighScore('minesweeper'));
  const { record } = useGameResult('minesweeper', { daily });
  useGameStatePersistence('minesweeper', gameState, s => s, s => !(s.isOver || s.isWon));
  const play = useSound();
  const { onKeyDown } = useGridKeyNav(cols);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (gameState.isRunning && !gameState.isOver && !gameState.isWon) {
      timerRef.current = setInterval(() => {
        setGameState(prev => ({ ...prev, time: prev.time + 1 }));
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isRunning, gameState.isOver, gameState.isWon]);

  useEffect(() => {
    if (gameState.isWon && gameState.time > 0) {
      const currentBest = getHighScore('minesweeper');
      if (currentBest === 0 || gameState.time < currentBest) {
        setHighScore('minesweeper', gameState.time);
        setBestTime(gameState.time);
      }
    }
  }, [gameState.isWon, gameState.time]);

  useEffect(() => {
    if (gameState.isOver || gameState.isWon) {
      record({ won: gameState.isWon, score: 0 });
    }
  }, [gameState.isOver, gameState.isWon]);

  const onReveal = (board: Board, isOver: boolean, isWon: boolean) => {
    play('click');
    setGameState(prev => ({
      ...prev,
      board,
      isOver,
      isWon,
      isRunning: !isOver && !isWon ? true : prev.isRunning,
    }));
  };

  const onFlag = (board: Board) => {
    setGameState(prev => ({ ...prev, board }));
  };

  const onCellClick = (r: number, c: number) => {
    handleCellClick(gameState.board, r, c, gameState.flagMode, onReveal, onFlag);
  };

  const onContextMenu = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    handleContextMenu(gameState.board, r, c, onFlag);
  };

  const onReset = () => {
    clearSavedState('minesweeper');
    setGameState(resetGame());
    setBestTime(getHighScore('minesweeper'));
  };

  const onToggleFlagMode = () => {
    setGameState(prev => ({ ...prev, flagMode: !prev.flagMode }));
  };

  const nc = ['', 'text-blue-400', 'text-green-400', 'text-red-400', 'text-purple-400', 'text-amber-400', 'text-cyan-400', 'text-pink-400', 'text-gray-400'];

  return (
    <GameLayout
      title="Minesweeper"
      score={`Time: ${gameState.time}s`}
      highScore={bestTime > 0 ? `${bestTime}s` : undefined}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.isOver && <p className="text-red-400">💥 Boom!</p>}
        {gameState.isWon && <p className="text-green-400">🏆 Cleared!</p>}

        {/* Difficulty Selector */}
        <DifficultySelector 
          value={difficulty} 
          onChange={(newDifficulty) => {
            setDifficulty(newDifficulty);
            // Reset game when difficulty changes
            const newSettings = getDifficultySettings(newDifficulty);
            const newRows = applyDifficulty(BASE_ROWS, newSettings, 'size');
            const newCols = applyDifficulty(BASE_COLS, newSettings, 'size');
            const newMines = applyDifficulty(BASE_MINES, newSettings, 'complexity');
            setGameState({
              board: createBoard(newRows, newCols, newMines, daily ? dailySeed : undefined),
              isOver: false,
              isWon: false,
              time: 0,
              isRunning: false,
              flagMode: false,
            });
          }}
          disabled={gameState.isRunning}
        />

        {/* Flag Mode Toggle */}
        <button
          onClick={onToggleFlagMode}
          className={`px-4 py-2 rounded-lg transition-all ${
            gameState.flagMode ? 'bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          {gameState.flagMode ? '🚩 Flag Mode ON' : '🚩 Flag Mode OFF'}
        </button>

        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div
            className="absolute inset-0 grid gap-[1px] bg-gray-700 p-1 rounded overflow-hidden" onKeyDown={onKeyDown}
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
          >
            {gameState.board.flat().map((cell, i) => {
              const r = Math.floor(i / cols);
              const c = i % cols;
              return (
                <button
                  key={i}
                  onClick={() => onCellClick(r, c)}
                  onContextMenu={e => onContextMenu(e, r, c)}
                  className={`flex items-center justify-center text-xs sm:text-sm font-bold rounded-sm min-h-[48px] min-w-[48px] ${
                    cell.revealed
                      ? cell.mine
                        ? 'bg-red-600'
                        : 'bg-gray-800'
                      : 'bg-gray-600 hover:bg-gray-500 active:bg-gray-500'
                  } ${cell.count > 0 && cell.revealed ? nc[cell.count] : ''}`}
                  style={{ touchAction: 'manipulation' }}
                >
                  {cell.revealed ? (cell.mine ? '💣' : cell.count || '') : cell.flagged ? '🚩' : ''}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-gray-500 text-xs">Tap to reveal • Toggle flag mode to mark mines</p>
      </div>
    </GameLayout>
  );
}
