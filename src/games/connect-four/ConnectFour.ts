// Pure game logic - no React, no UI, no input handling

export type Board = number[][];
export const ROWS = 6;
export const COLS = 7;

export interface GameState {
  board: Board;
  isPlayerTurn: boolean;
  isGameOver: boolean;
  result: string;
  wins: number;
}

export interface ConnectFourConfig {
  rows: number;
  cols: number;
  winLength: number;
}

export function createBoard(): Board {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

export function createInitialState(): GameState {
  return {
    board: createBoard(),
    isPlayerTurn: true,
    isGameOver: false,
    result: '',
    wins: 0,
  };
}

export function dropPiece(board: Board, col: number, player: number): Board | null {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      const nb = board.map(row => [...row]);
      nb[r][col] = player;
      return nb;
    }
  }
  return null;
}

export function checkWin(board: Board, player: number): boolean {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        let count = 0;
        for (let i = 0; i < 4; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc] === player) count++;
          else break;
        }
        if (count === 4) return true;
      }
    }
  }
  return false;
}

export function isBoardFull(board: Board): boolean {
  return board[0].every(c => c !== 0);
}

export function evaluate(board: Board, player: number): number {
  let score = 0;
  for (let r = 0; r < ROWS; r++) if (board[r][3] === player) score += 3;
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      for (const [dr, dc] of dirs) {
        let p = 0, o = 0, empty = 0;
        for (let i = 0; i < 4; i++) {
          const nr = r + dr * i, nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
          if (board[nr][nc] === player) p++;
          else if (board[nr][nc] === 0) empty++;
          else o++;
        }
        if (p === 3 && empty === 1) score += 50;
        if (p === 2 && empty === 2) score += 10;
        if (o === 3 && empty === 1) score -= 40;
      }
    }
  }
  return score;
}

export function minimax(board: Board, depth: number, alpha: number, beta: number, maximizing: boolean, player: number, opponent: number): number {
  if (depth === 0 || checkWin(board, player) || checkWin(board, opponent)) {
    if (checkWin(board, player)) return 10000;
    if (checkWin(board, opponent)) return -10000;
    return evaluate(board, player);
  }

  const moves: number[] = [];
  for (let c = 0; c < COLS; c++) if (board[0][c] === 0) moves.push(c);

  if (maximizing) {
    let maxEval = -Infinity;
    for (const col of moves) {
      const nb = dropPiece(board, col, player);
      if (nb) {
        const eval_ = minimax(nb, depth - 1, alpha, beta, false, player, opponent);
        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const col of moves) {
      const nb = dropPiece(board, col, opponent);
      if (nb) {
        const eval_ = minimax(nb, depth - 1, alpha, beta, true, player, opponent);
        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
}

export function getBestMove(board: Board, depth: number = 5): number {
  let bestScore = -Infinity;
  let bestCol = 3;
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === 0) {
      const nb = dropPiece(board, c, 2);
      if (nb) {
        const score = minimax(nb, depth, -Infinity, Infinity, false, 2, 1);
        if (score > bestScore) {
          bestScore = score;
          bestCol = c;
        }
      }
    }
  }
  return bestCol;
}
