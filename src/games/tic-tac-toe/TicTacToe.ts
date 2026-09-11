// Pure game logic - no React, no UI, no input handling

export type Board = (string | null)[];
export const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

export interface GameState {
  board: Board;
  isPlayerTurn: boolean;
  isGameOver: boolean;
  result: string | null;
  wins: number;
}

export interface TicTacToeConfig {
  playerSymbol: string;
  botSymbol: string;
}

export function createInitialState(): GameState {
  return {
    board: Array(9).fill(null),
    isPlayerTurn: true,
    isGameOver: false,
    result: null,
    wins: 0,
  };
}

export function checkWinner(board: Board): string | null {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

export function isBoardFull(board: Board): boolean {
  return board.every(cell => cell !== null);
}

export function minimax(board: Board, isMaximizing: boolean): number {
  const winner = checkWinner(board);
  if (winner === 'O') return 10;
  if (winner === 'X') return -10;
  if (isBoardFull(board)) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const score = minimax(board, false);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        const score = minimax(board, true);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

export function getBestMove(board: Board): number {
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      const score = minimax(board, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

export function makeMove(board: Board, idx: number, symbol: string): Board {
  const newBoard = [...board];
  newBoard[idx] = symbol;
  return newBoard;
}
