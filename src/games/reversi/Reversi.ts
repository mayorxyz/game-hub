// Pure game logic for Reversi - no React, no UI, no input handling

export const BOARD_SIZE = 8;
export const DIRECTIONS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

export type Board = number[][];
export type Position = [number, number];

export interface ReversiState {
  board: Board;
  isPlayerTurn: boolean;
  isGameOver: boolean;
  result: string;
  wins: number;
}

export function createBoard(): Board {
  const b = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
  b[3][3] = 2;
  b[3][4] = 1;
  b[4][3] = 1;
  b[4][4] = 2;
  return b;
}

export function createInitialState(): ReversiState {
  return {
    board: createBoard(),
    isPlayerTurn: true,
    isGameOver: false,
    result: '',
    wins: 0,
  };
}

export function getFlips(board: Board, r: number, c: number, player: number): Position[] {
  if (board[r][c] !== 0) return [];
  const opp = player === 1 ? 2 : 1;
  const flips: Position[] = [];
  
  for (const [dr, dc] of DIRECTIONS) {
    const temp: Position[] = [];
    let nr = r + dr;
    let nc = c + dc;
    
    while (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === opp) {
      temp.push([nr, nc]);
      nr += dr;
      nc += dc;
    }
    
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && board[nr][nc] === player && temp.length > 0) {
      flips.push(...temp);
    }
  }
  
  return flips;
}

export function getValidMoves(board: Board, player: number): Position[] {
  const moves: Position[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (getFlips(board, r, c, player).length > 0) {
        moves.push([r, c]);
      }
    }
  }
  return moves;
}

export function applyMove(board: Board, r: number, c: number, player: number): Board {
  const nb = board.map(row => [...row]);
  const flips = getFlips(nb, r, c, player);
  nb[r][c] = player;
  flips.forEach(([fr, fc]) => {
    nb[fr][fc] = player;
  });
  return nb;
}

export function countPieces(board: Board, player: number): number {
  return board.flat().filter(c => c === player).length;
}

export function evaluate(board: Board, player: number): number {
  let score = 0;
  const corners: Position[] = [[0, 0], [0, 7], [7, 0], [7, 7]];
  const opp = player === 1 ? 2 : 1;
  
  corners.forEach(([r, c]) => {
    if (board[r][c] === player) score += 50;
    else if (board[r][c] === opp) score -= 50;
  });
  
  score += countPieces(board, player) - countPieces(board, opp);
  return score;
}

export function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean,
  player: number,
  opponent: number
): number {
  if (depth === 0 || (getValidMoves(board, 1).length === 0 && getValidMoves(board, 2).length === 0)) {
    return evaluate(board, player);
  }

  const currentPlayer = maximizing ? player : opponent;
  const moves = getValidMoves(board, currentPlayer);
  
  if (moves.length === 0) {
    return minimax(board, depth - 1, alpha, beta, !maximizing, player, opponent);
  }

  if (maximizing) {
    let maxEval = -Infinity;
    for (const [r, c] of moves) {
      const nb = applyMove(board, r, c, currentPlayer);
      const eval_ = minimax(nb, depth - 1, alpha, beta, false, player, opponent);
      maxEval = Math.max(maxEval, eval_);
      alpha = Math.max(alpha, eval_);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const [r, c] of moves) {
      const nb = applyMove(board, r, c, currentPlayer);
      const eval_ = minimax(nb, depth - 1, alpha, beta, true, player, opponent);
      minEval = Math.min(minEval, eval_);
      beta = Math.min(beta, eval_);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function getBestMove(board: Board): Position {
  const moves = getValidMoves(board, 2);
  let bestScore = -Infinity;
  let bestMove = moves[0];
  
  for (const [r, c] of moves) {
    const nb = applyMove(board, r, c, 2);
    const score = minimax(nb, 4, -Infinity, Infinity, false, 2, 1);
    if (score > bestScore) {
      bestScore = score;
      bestMove = [r, c];
    }
  }
  
  return bestMove;
}

export function checkGameOver(board: Board): { isOver: boolean; winner: string } {
  const playerMoves = getValidMoves(board, 1);
  const botMoves = getValidMoves(board, 2);
  
  if (playerMoves.length === 0 && botMoves.length === 0) {
    const p = countPieces(board, 1);
    const b = countPieces(board, 2);
    const winner = p > b ? 'You win! 🎉' : p < b ? 'Bot wins!' : 'Draw!';
    return { isOver: true, winner };
  }
  
  return { isOver: false, winner: '' };
}
