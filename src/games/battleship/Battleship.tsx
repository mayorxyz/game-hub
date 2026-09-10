import React, { useState, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

const SIZE = 10;
const SHIPS = [5, 4, 3, 3, 2];

type CellState = 'empty' | 'miss' | 'hit';

function placeShips(): boolean[][] {
  const grid: boolean[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  for (const size of SHIPS) {
    let placed = false;
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const horizontal = Math.random() > 0.5;
      const r = Math.floor(Math.random() * (horizontal ? SIZE : SIZE - size + 1));
      const c = Math.floor(Math.random() * (horizontal ? SIZE - size + 1 : SIZE));
      let canPlace = true;
      for (let i = 0; i < size; i++) {
        const cr = horizontal ? r : r + i;
        const cc = horizontal ? c + i : c;
        if (grid[cr][cc]) { canPlace = false; break; }
      }
      if (canPlace) {
        for (let i = 0; i < size; i++) {
          const cr = horizontal ? r : r + i;
          const cc = horizontal ? c + i : c;
          grid[cr][cc] = true;
        }
        placed = true;
      }
    }
  }
  return grid;
}

function emptyBoard(): CellState[][] {
  return Array.from({ length: SIZE }, () => Array<CellState>(SIZE).fill('empty'));
}

function botGuess(board: CellState[][]): [number, number] {
  // Probability density targeting
  const prob: number[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (const size of SHIPS) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        // Horizontal placements
        if (c + size <= SIZE) {
          let valid = true;
          for (let i = 0; i < size; i++) {
            const s = board[r][c + i];
            if (s === 'miss' || s === 'hit') { valid = false; break; }
          }
          if (valid) for (let i = 0; i < size; i++) prob[r][c + i]++;
        }
        // Vertical placements
        if (r + size <= SIZE) {
          let valid = true;
          for (let i = 0; i < size; i++) {
            const s = board[r + i][c];
            if (s === 'miss' || s === 'hit') { valid = false; break; }
          }
          if (valid) for (let i = 0; i < size; i++) prob[r + i][c]++;
        }
      }
    }
  }
  let maxProb = 0;
  let bestMoves: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === 'empty') {
        if (prob[r][c] > maxProb) {
          maxProb = prob[r][c];
          bestMoves = [[r, c]];
        } else if (prob[r][c] === maxProb && maxProb > 0) {
          bestMoves.push([r, c]);
        }
      }
    }
  }
  if (bestMoves.length === 0) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (board[r][c] === 'empty') bestMoves.push([r, c]);
      }
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

const totalShipCells = SHIPS.reduce((a, b) => a + b, 0);

export default function Battleship() {
  // Player's own ship placement (hidden from bot, bot attacks this)
  const [playerShips] = useState(() => placeShips());
  // Bot's ship placement (hidden from player, player attacks this)
  const [botShips] = useState(() => placeShips());

  // Player's board: shows bot's attacks on player
  const [playerBoard, setPlayerBoard] = useState<CellState[][]>(emptyBoard);
  // Bot's board: shows player's attacks on bot
  const [botBoard, setBotBoard] = useState<CellState[][]>(emptyBoard);

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState('');
  const [highScore, setHS] = useState(getHighScore('battleship'));

  // Count hits
  const playerHitsOnBot = botBoard.flat().filter(c => c === 'hit').length;
  const botHitsOnPlayer = playerBoard.flat().filter(c => c === 'hit').length;

  const handleAttack = useCallback((r: number, c: number) => {
    if (gameOver || !isPlayerTurn || botBoard[r][c] !== 'empty') return;

    // Player attacks bot's board
    const isHit = botShips[r][c];
    const newBotBoard = botBoard.map(row => [...row]);
    newBotBoard[r][c] = isHit ? 'hit' : 'miss';
    setBotBoard(newBotBoard);

    const newPlayerHits = playerHitsOnBot + (isHit ? 1 : 0);

    if (newPlayerHits >= totalShipCells) {
      setGameOver(true);
      setResult('You win! 🎉');
      setHS(h => {
        const best = Math.max(h, 1000);
        setHighScore('battleship', best);
        return best;
      });
      return;
    }

    // Bot's turn
    setIsPlayerTurn(false);
    setTimeout(() => {
      const [br, bc] = botGuess(playerBoard);
      const botHit = playerShips[br][bc];
      const newPlayerBoard = playerBoard.map(row => [...row]);
      newPlayerBoard[br][bc] = botHit ? 'hit' : 'miss';
      setPlayerBoard(newPlayerBoard);

      const newBotHits = botHitsOnPlayer + (botHit ? 1 : 0);
      if (newBotHits >= totalShipCells) {
        setGameOver(true);
        setResult('Bot wins! 🤖');
        return;
      }

      setIsPlayerTurn(true);
    }, 500);
  }, [gameOver, isPlayerTurn, botBoard, botShips, playerBoard, playerShips, playerHitsOnBot, botHitsOnPlayer]);

  const reset = useCallback(() => {
    // Full state reset without page reload
    window.location.reload();
  }, []);

  return (
    <GameLayout
      title="Battleship"
      score={`Your hits: ${playerHitsOnBot}/${totalShipCells}`}
      highScore={highScore}
      onReset={reset}
    >
      <div className="flex flex-col items-center gap-4">
        {result && <p className="text-xl font-bold text-amber-400">{result}</p>}

        {/* Player's board (shows bot's attacks on player) */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Your Waters (Bot's attacks)</p>
          <div className="inline-grid gap-[1px] bg-gray-700 p-1 rounded" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
            {playerBoard.flat().map((cell, i) => (
              <div key={i} className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs rounded-sm ${
                cell === 'hit' ? 'bg-red-600' : cell === 'miss' ? 'bg-blue-900' : 'bg-gray-800'
              }`}>
                {cell === 'hit' ? '💥' : cell === 'miss' ? '·' : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Bot's board (player attacks here) */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2">Enemy Waters (Your attacks)</p>
          <div className="inline-grid gap-[1px] bg-gray-700 p-1 rounded" style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}>
            {botBoard.flat().map((cell, i) => {
              const r = Math.floor(i / SIZE), c = i % SIZE;
              return (
                <button
                  key={i}
                  onClick={() => handleAttack(r, c)}
                  disabled={!isPlayerTurn || cell !== 'empty' || gameOver}
                  className={`w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs rounded-sm transition-colors ${
                    cell === 'hit' ? 'bg-red-600' :
                    cell === 'miss' ? 'bg-blue-900' :
                    isPlayerTurn && !gameOver ? 'bg-gray-800 hover:bg-gray-600 cursor-pointer' :
                    'bg-gray-800 cursor-not-allowed'
                  }`}
                >
                  {cell === 'hit' ? '🔥' : cell === 'miss' ? '·' : ''}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-gray-500 text-xs">
          {isPlayerTurn && !gameOver ? 'Your turn — tap enemy waters to fire' : 'Bot is thinking...'}
        </p>
      </div>
    </GameLayout>
  );
}
