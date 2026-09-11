// Pure game logic - no React, no UI, no input handling

export const GRID_SIZE = 10;
export const SHIPS = [5, 4, 3, 3, 2];
export const TOTAL_SHIP_CELLS = SHIPS.reduce((a, b) => a + b, 0);

export type CellState = 'empty' | 'miss' | 'hit';
export type Board = CellState[][];
export type ShipPlacement = boolean[][];

export interface GameState {
  playerShips: ShipPlacement;
  botShips: ShipPlacement;
  playerBoard: Board;
  botBoard: Board;
  isPlayerTurn: boolean;
  isGameOver: boolean;
  result: string;
}

export interface BattleshipConfig {
  gridSize: number;
  ships: number[];
}

export function placeShips(): ShipPlacement {
  const grid: ShipPlacement = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(false));
  for (const size of SHIPS) {
    let placed = false;
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const horizontal = Math.random() > 0.5;
      const r = Math.floor(Math.random() * (horizontal ? GRID_SIZE : GRID_SIZE - size + 1));
      const c = Math.floor(Math.random() * (horizontal ? GRID_SIZE - size + 1 : GRID_SIZE));
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

export function emptyBoard(): Board {
  return Array.from({ length: GRID_SIZE }, () => Array<CellState>(GRID_SIZE).fill('empty'));
}

export function botGuess(board: Board): [number, number] {
  // Probability density targeting
  const prob: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  for (const size of SHIPS) {
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        // Horizontal placements
        if (c + size <= GRID_SIZE) {
          let valid = true;
          for (let i = 0; i < size; i++) {
            const s = board[r][c + i];
            if (s === 'miss' || s === 'hit') { valid = false; break; }
          }
          if (valid) for (let i = 0; i < size; i++) prob[r][c + i]++;
        }
        // Vertical placements
        if (r + size <= GRID_SIZE) {
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
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
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
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r][c] === 'empty') bestMoves.push([r, c]);
      }
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

export function createInitialState(): GameState {
  return {
    playerShips: placeShips(),
    botShips: placeShips(),
    playerBoard: emptyBoard(),
    botBoard: emptyBoard(),
    isPlayerTurn: true,
    isGameOver: false,
    result: '',
  };
}

export function countHits(board: Board): number {
  return board.flat().filter(c => c === 'hit').length;
}

export function attackBoard(
  board: Board,
  ships: ShipPlacement,
  r: number,
  c: number
): { newBoard: Board; isHit: boolean } {
  const isHit = ships[r][c];
  const newBoard = board.map(row => [...row]);
  newBoard[r][c] = isHit ? 'hit' : 'miss';
  return { newBoard, isHit };
}
