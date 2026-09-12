// Pure game logic for Gomoku - no React, no UI, no input handling

export const BOARD_SIZE = 15;
export const WIN_LENGTH = 5;

export type Board = number[][];
export type Player = 1 | 2; // 1 = player, 2 = bot

export interface GomokuState {
  board: Board;
  isPlayerTurn: boolean;
  isGameOver: boolean;
  result: string;
  wins: number;
}

export function createBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

export function createInitialState(): GomokuState {
  return {
    board: createBoard(),
    isPlayerTurn: true,
    isGameOver: false,
    result: '',
    wins: 0,
  };
}

export function checkWin(board: Board, player: number): boolean {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (const [dr, dc] of dirs) {
        let count = 0;
        for (let i = 0; i < WIN_LENGTH; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player) {
            count++;
          } else {
            break;
          }
        }
        if (count >= WIN_LENGTH) return true;
      }
    }
  }
  return false;
}

export function evaluate(board: Board, player: number): number {
  const opp = player === 1 ? 2 : 1;
  let score = 0;
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      for (const [dr, dc] of dirs) {
        let p = 0;
        let o = 0;
        for (let i = 0; i < WIN_LENGTH; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
          if (board[nr][nc] === player) p++;
          else if (board[nr][nc] === opp) o++;
        }
        if (p > 0 && o === 0) score += p * p * 10;
        if (o > 0 && p === 0) score -= o * o * 10;
      }
    }
  }
  return score;
}

// `skill` below 1 makes the bot play a random candidate some of the time.
// A larger `radius` widens the searched area around existing stones.
export function getBestMove(board: Board, skill: number = 1, radius: number = 2): [number, number] {
  let bestScore = -Infinity;
  let bestMove: [number, number] = [7, 7];
  const candidates: [number, number][] = [];
  
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 0) {
        for (let dr = -radius; dr <= radius; dr++) {
          for (let dc = -radius; dc <= radius; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === 0) {
              if (!candidates.some(([cr, cc]) => cr === nr && cc === nc)) {
                candidates.push([nr, nc]);
              }
            }
          }
        }
      }
    }
  }
  
  if (candidates.length === 0) return [7, 7];

  if (Math.random() > skill) {
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  for (const [r, c] of candidates) {
    board[r][c] = 2;
    const s = evaluate(board, 2);
    board[r][c] = 0;
    if (s > bestScore) {
      bestScore = s;
      bestMove = [r, c];
    }
  }
  return bestMove;
}

export function makeMove(board: Board, row: number, col: number, player: Player): Board {
  const newBoard = board.map(row => [...row]);
  newBoard[row][col] = player;
  return newBoard;
}
