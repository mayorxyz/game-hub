// Pure game logic - no React, no UI, no input handling

export const BOARD_SIZE = 8;

export type Player = 1 | 2;
export type Piece = { player: Player; king: boolean } | null;
export type Board = Piece[][];

export interface Move {
  from: [number, number];
  to: [number, number];
  captures: [number, number][];
}

export interface GameState {
  board: Board;
  selected: [number, number] | null;
  isPlayerTurn: boolean;
  isGameOver: boolean;
  result: string;
  wins: number;
}

export interface CheckersConfig {
  boardSize: number;
}

export function createBoard(): Board {
  const b: Board = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) b[r][c] = { player: 2, king: false };
    }
  }
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if ((r + c) % 2 === 1) b[r][c] = { player: 1, king: false };
    }
  }
  return b;
}

export function createInitialState(): GameState {
  return {
    board: createBoard(),
    selected: null,
    isPlayerTurn: true,
    isGameOver: false,
    result: '',
    wins: 0,
  };
}

export function getMoves(board: Board, r: number, c: number): Move[] {
  const piece = board[r][c];
  if (!piece) return [];
  
  const moves: Move[] = [];
  const dirs = piece.king
    ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
    : piece.player === 1
    ? [[-1, -1], [-1, 1]]
    : [[1, -1], [1, 1]];

  // Regular moves
  for (const [dr, dc] of dirs) {
    const nr = r + dr;
    const nc = c + dc;
    if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && !board[nr][nc]) {
      moves.push({ from: [r, c], to: [nr, nc], captures: [] });
    }
  }

  // Capture moves
  const opp: Player = piece.player === 1 ? 2 : 1;
  for (const [dr, dc] of dirs) {
    const mr = r + dr;
    const mc = c + dc;
    const nr = r + 2 * dr;
    const nc = c + 2 * dc;
    if (
      nr >= 0 &&
      nr < BOARD_SIZE &&
      nc >= 0 &&
      nc < BOARD_SIZE &&
      board[mr]?.[mc]?.player === opp &&
      !board[nr][nc]
    ) {
      moves.push({ from: [r, c], to: [nr, nc], captures: [[mr, mc]] });
    }
  }

  return moves;
}

export function getAllMoves(board: Board, player: Player): Move[] {
  const all: Move[] = [];
  let hasCaptures = false;

  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c]?.player === player) {
        const moves = getMoves(board, r, c);
        for (const m of moves) {
          if (m.captures.length > 0) hasCaptures = true;
          all.push(m);
        }
      }
    }
  }

  return hasCaptures ? all.filter(m => m.captures.length > 0) : all;
}

export function applyMove(board: Board, from: [number, number], to: [number, number], captures: [number, number][]): Board {
  const nb = board.map(row => row.map(cell => (cell ? { ...cell } : null)));
  const piece = nb[from[0]][from[1]]!;
  nb[from[0]][from[1]] = null;
  nb[to[0]][to[1]] = piece;
  captures.forEach(([cr, cc]) => {
    nb[cr][cc] = null;
  });
  
  // King promotion
  if (piece.player === 1 && to[0] === 0) piece.king = true;
  if (piece.player === 2 && to[0] === BOARD_SIZE - 1) piece.king = true;
  
  return nb;
}

export function botMove(board: Board): Move | null {
  const moves = getAllMoves(board, 2);
  if (moves.length === 0) return null;
  
  const captures = moves.filter(m => m.captures.length > 0);
  if (captures.length > 0) {
    return captures[Math.floor(Math.random() * captures.length)];
  }
  return moves[Math.floor(Math.random() * moves.length)];
}

export function checkGameOver(board: Board): { isOver: boolean; winner: string } {
  const playerMoves = getAllMoves(board, 1);
  const botMoves = getAllMoves(board, 2);

  if (botMoves.length === 0 && playerMoves.length === 0) {
    return { isOver: true, winner: 'Game Over!' };
  }
  if (botMoves.length === 0) {
    return { isOver: true, winner: 'You win! 🎉' };
  }
  if (playerMoves.length === 0) {
    return { isOver: true, winner: 'Bot wins! 🤖' };
  }

  return { isOver: false, winner: '' };
}
