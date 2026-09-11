import React, { useState, useCallback, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  BOARD_SIZE,
  Move,
  GameState,
  createInitialState,
  applyMove,
  getAllMoves,
  botMove,
  checkGameOver,
} from './Checkers';
import { handleCellClick } from './Checkers.controls';

export default function Checkers() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('checkers'));

  const onMove = useCallback((move: Move) => {
    const newBoard = applyMove(gameState.board, move.from, move.to, move.captures);
    setGameState(prev => ({ ...prev, board: newBoard }));

    const { isOver, winner } = checkGameOver(newBoard);
    if (isOver) {
      setGameState(prev => ({ ...prev, isGameOver: true, result: winner }));
      if (winner.includes('You win')) {
        const newWins = gameState.wins + 1;
        setGameState(prev => ({ ...prev, wins: newWins }));
        setHighScoreState(prev => {
          const best = Math.max(prev, newWins);
          setHighScore('checkers', best);
          return best;
        });
      }
      return;
    }

    setGameState(prev => ({ ...prev, isPlayerTurn: false }));

    setTimeout(() => {
      const bm = botMove(newBoard);
      if (bm) {
        const nb2 = applyMove(newBoard, bm.from, bm.to, bm.captures);
        setGameState(prev => ({ ...prev, board: nb2 }));
        
        const { isOver: isOver2, winner: winner2 } = checkGameOver(nb2);
        if (isOver2) {
          setGameState(prev => ({ ...prev, isGameOver: true, result: winner2 }));
          if (winner2.includes('You win')) {
            const newWins = gameState.wins + 1;
            setGameState(prev => ({ ...prev, wins: newWins }));
            setHighScoreState(prev => {
              const best = Math.max(prev, newWins);
              setHighScore('checkers', best);
              return best;
            });
          }
        }
      } else {
        setGameState(prev => ({ ...prev, isGameOver: true, result: 'You win! 🎉' }));
        const newWins = gameState.wins + 1;
        setGameState(prev => ({ ...prev, wins: newWins }));
        setHighScoreState(prev => {
          const best = Math.max(prev, newWins);
          setHighScore('checkers', best);
          return best;
        });
      }
      setGameState(prev => ({ ...prev, isPlayerTurn: true }));
    }, 500);
  }, [gameState.board, gameState.wins]);

  const onSelect = useCallback((pos: [number, number] | null) => {
    setGameState(prev => ({ ...prev, selected: pos }));
  }, []);

  const onCellClick = useCallback((r: number, c: number) => {
    handleCellClick(
      gameState.board,
      r,
      c,
      gameState.isGameOver,
      gameState.isPlayerTurn,
      gameState.selected,
      onSelect,
      onMove
    );
  }, [gameState.board, gameState.isGameOver, gameState.isPlayerTurn, gameState.selected, onSelect, onMove]);

  const validMoves = gameState.selected
    ? getAllMoves(gameState.board, 1).filter(
        m => m.from[0] === gameState.selected![0] && m.from[1] === gameState.selected![1]
      )
    : [];

  const reset = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  return (
    <GameLayout
      title="Checkers"
      score={`Wins: ${gameState.wins}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.result && <p className="text-xl font-bold text-amber-400">{gameState.result}</p>}
        
        {/* Responsive Game Grid */}
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
        </div>
        
        <p className="text-gray-500 text-xs">You are red · Bot is black</p>
      </div>
    </GameLayout>
  );
}
