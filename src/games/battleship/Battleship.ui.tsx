import React, { useState, useCallback, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  GameState,
  GRID_SIZE,
  TOTAL_SHIP_CELLS,
  createInitialState,
  countHits,
  attackBoard,
  botGuess,
} from './Battleship';
import { handleAttackClick } from './Battleship.controls';

export default function Battleship() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('battleship'));

  const playerHitsOnBot = countHits(gameState.botBoard);
  const botHitsOnPlayer = countHits(gameState.playerBoard);

  const handleAttack = useCallback((r: number, c: number) => {
    if (gameState.isGameOver || !gameState.isPlayerTurn || gameState.botBoard[r][c] !== 'empty') return;

    // Player attacks bot's board
    const { newBoard: newBotBoard, isHit } = attackBoard(gameState.botBoard, gameState.botShips, r, c);
    
    const newPlayerHits = playerHitsOnBot + (isHit ? 1 : 0);

    if (newPlayerHits >= TOTAL_SHIP_CELLS) {
      setGameState(prev => ({
        ...prev,
        botBoard: newBotBoard,
        isGameOver: true,
        result: 'You win! 🎉',
      }));
      setHighScoreState(prev => {
        const best = Math.max(prev, 1000);
        setHighScore('battleship', best);
        return best;
      });
      return;
    }

    // Bot's turn
    setGameState(prev => ({
      ...prev,
      botBoard: newBotBoard,
      isPlayerTurn: false,
    }));

    setTimeout(() => {
      setGameState(prev => {
        const [br, bc] = botGuess(prev.playerBoard);
        const { newBoard: newPlayerBoard, isHit: botHit } = attackBoard(prev.playerBoard, prev.playerShips, br, bc);
        
        const newBotHits = botHitsOnPlayer + (botHit ? 1 : 0);
        
        if (newBotHits >= TOTAL_SHIP_CELLS) {
          return {
            ...prev,
            playerBoard: newPlayerBoard,
            isGameOver: true,
            result: 'Bot wins! 🤖',
          };
        }

        return {
          ...prev,
          playerBoard: newPlayerBoard,
          isPlayerTurn: true,
        };
      });
    }, 500);
  }, [gameState, playerHitsOnBot, botHitsOnPlayer]);

  const onCellClick = useCallback((r: number, c: number) => {
    handleAttackClick(
      gameState.isPlayerTurn,
      gameState.isGameOver,
      gameState.botBoard[r][c],
      handleAttack,
      r,
      c
    );
  }, [gameState.isPlayerTurn, gameState.isGameOver, gameState.botBoard, handleAttack]);

  const reset = useCallback(() => {
    setGameState(createInitialState());
  }, []);

  return (
    <GameLayout
      title="Battleship"
      score={`Your hits: ${playerHitsOnBot}/${TOTAL_SHIP_CELLS}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {gameState.result && <p className="text-xl font-bold text-amber-400">{gameState.result}</p>}

        {/* Player's board (shows bot's attacks on player) */}
        <div className="w-full max-w-[min(90vw,40vh)]">
          <p className="text-gray-400 text-sm mb-2 text-center">Your Waters (Bot's attacks)</p>
          <div className="relative aspect-square">
            <div
              className="absolute inset-0 grid gap-[1px] bg-gray-700 p-1 rounded overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              }}
            >
              {gameState.playerBoard.flat().map((cell, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-center text-xs rounded-sm min-h-[32px] min-w-[32px] ${
                    cell === 'hit' ? 'bg-red-600' : cell === 'miss' ? 'bg-blue-900' : 'bg-gray-800'
                  }`}
                >
                  {cell === 'hit' ? '💥' : cell === 'miss' ? '·' : ''}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bot's board (player attacks here) */}
        <div className="w-full max-w-[min(90vw,40vh)]">
          <p className="text-gray-400 text-sm mb-2 text-center">Enemy Waters (Your attacks)</p>
          <div className="relative aspect-square">
            <div
              className="absolute inset-0 grid gap-[1px] bg-gray-700 p-1 rounded overflow-hidden"
              style={{
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              }}
            >
              {gameState.botBoard.flat().map((cell, i) => {
                const r = Math.floor(i / GRID_SIZE);
                const c = i % GRID_SIZE;
                return (
                  <button
                    key={i}
                    onClick={() => onCellClick(r, c)}
                    disabled={!gameState.isPlayerTurn || cell !== 'empty' || gameState.isGameOver}
                    className={`flex items-center justify-center text-xs rounded-sm transition-colors min-h-[32px] min-w-[32px] ${
                      cell === 'hit'
                        ? 'bg-red-600'
                        : cell === 'miss'
                        ? 'bg-blue-900'
                        : gameState.isPlayerTurn && !gameState.isGameOver
                        ? 'bg-gray-800 hover:bg-gray-600 cursor-pointer'
                        : 'bg-gray-800 cursor-not-allowed'
                    }`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {cell === 'hit' ? '🔥' : cell === 'miss' ? '·' : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-gray-500 text-xs">
          {gameState.isPlayerTurn && !gameState.isGameOver ? 'Your turn — tap enemy waters to fire' : 'Bot is thinking...'}
        </p>
      </div>
    </GameLayout>
  );
}
