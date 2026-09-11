import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  BOARD_SIZE,
  Board,
  ReversiState,
  createInitialState,
  getValidMoves,
  applyMove,
  countPieces,
  getBestMove,
  checkGameOver,
} from './Reversi';
import { handleCellClick } from './Reversi.controls';

export default function Reversi() {
  const [gameState, setGameState] = useState<ReversiState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('reversi'));

  // Auto-pass if player has no valid moves
  useEffect(() => {
    if (gameState.isGameOver || !gameState.isPlayerTurn) return;
    
    const playerMoves = getValidMoves(gameState.board, 1);
    const botMoves = getValidMoves(gameState.board, 2);
    
    if (playerMoves.length === 0) {
      if (botMoves.length === 0) {
        // Game over
        const { isOver, winner } = checkGameOver(gameState.board);
        setGameState(prev => ({
          ...prev,
          isGameOver: isOver,
          result: winner,
        }));
        if (winner.includes('You win')) {
          const newWins = gameState.wins + 1;
          setGameState(prev => ({ ...prev, wins: newWins }));
          setHighScoreState(prev => {
            const best = Math.max(prev, newWins);
            setHighScore('reversi', best);
            return best;
          });
        }
      } else {
        // Player passes, bot goes
        setGameState(prev => ({ ...prev, isPlayerTurn: false }));
        setTimeout(() => {
          const [br, bc] = getBestMove(gameState.board);
          const nb = applyMove(gameState.board, br, bc, 2);
          setGameState(prev => ({ ...prev, board: nb, isPlayerTurn: true }));
        }, 400);
      }
    }
  }, [gameState.board, gameState.isPlayerTurn, gameState.isGameOver, gameState.wins]);

  const onMove = (r: number, c: number) => {
    const nb = applyMove(gameState.board, r, c, 1);
    setGameState(prev => ({ ...prev, board: nb }));

    const botMoves = getValidMoves(nb, 2);
    const playerMoves = getValidMoves(nb, 1);
    
    const { isOver, winner } = checkGameOver(nb);
    if (isOver) {
      setGameState(prev => ({
        ...prev,
        isGameOver: true,
        result: winner,
      }));
      if (winner.includes('You win')) {
        const newWins = gameState.wins + 1;
        setGameState(prev => ({ ...prev, wins: newWins }));
        setHighScoreState(prev => {
          const best = Math.max(prev, newWins);
          setHighScore('reversi', best);
          return best;
        });
      }
      return;
    }
    
    if (botMoves.length === 0) return;

    setGameState(prev => ({ ...prev, isPlayerTurn: false }));
    setTimeout(() => {
      const [br, bc] = getBestMove(nb);
      const nb2 = applyMove(nb, br, bc, 2);
      setGameState(prev => ({ ...prev, board: nb2 }));
      
      const pm = getValidMoves(nb2, 1);
      const bm = getValidMoves(nb2, 2);
      
      const { isOver: isOver2, winner: winner2 } = checkGameOver(nb2);
      if (isOver2) {
        setGameState(prev => ({
          ...prev,
          isGameOver: true,
          result: winner2,
        }));
        if (winner2.includes('You win')) {
          const newWins = gameState.wins + 1;
          setGameState(prev => ({ ...prev, wins: newWins }));
          setHighScoreState(prev => {
            const best = Math.max(prev, newWins);
            setHighScore('reversi', best);
            return best;
          });
        }
      } else if (pm.length === 0) {
        // Player has no moves, bot goes again
        setTimeout(() => {
          const [br2, bc2] = getBestMove(nb2);
          const nb3 = applyMove(nb2, br2, bc2, 2);
          setGameState(prev => ({ ...prev, board: nb3 }));
          
          const pm2 = getValidMoves(nb3, 1);
          const bm2 = getValidMoves(nb3, 2);
          
          const { isOver: isOver3, winner: winner3 } = checkGameOver(nb3);
          if (isOver3) {
            setGameState(prev => ({
              ...prev,
              isGameOver: true,
              result: winner3,
            }));
            if (winner3.includes('You win')) {
              const newWins = gameState.wins + 1;
              setGameState(prev => ({ ...prev, wins: newWins }));
              setHighScoreState(prev => {
                const best = Math.max(prev, newWins);
                setHighScore('reversi', best);
                return best;
              });
            }
          } else {
            setGameState(prev => ({ ...prev, isPlayerTurn: true }));
          }
        }, 400);
      } else {
        setGameState(prev => ({ ...prev, isPlayerTurn: true }));
      }
    }, 400);
  };

  const onCellClick = (r: number, c: number) => {
    handleCellClick(gameState.board, r, c, gameState.isPlayerTurn, gameState.isGameOver, onMove);
  };

  const validMoves = gameState.isPlayerTurn ? getValidMoves(gameState.board, 1) : [];
  
  const onReset = () => {
    setGameState(createInitialState());
  };

  return (
    <GameLayout
      title="Reversi"
      score={`⚫${countPieces(gameState.board, 1)} ⚪${countPieces(gameState.board, 2)}`}
      highScore={highScore}
      onReset={onReset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.result && <p className="text-xl font-bold text-amber-400">{gameState.result}</p>}
        
        {/* Responsive Game Grid */}
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
        </div>
        
        <p className="text-gray-500 text-xs">You are ⚫ · Bot is ⚪</p>
      </div>
    </GameLayout>
  );
}
