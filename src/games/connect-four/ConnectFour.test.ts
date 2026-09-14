import { describe, it, expect } from 'vitest';
import {
  createBoard,
  dropPiece,
  checkWin,
  isBoardFull,
  evaluate,
  getBestMove,
  createInitialState,
  ROWS,
  COLS,
} from './ConnectFour';

const empty = () => createBoard();

function drop(board: number[][], col: number, player: number): number[][] {
  const nb = dropPiece(board, col, player);
  if (!nb) throw new Error(`drop into full column ${col}`);
  return nb;
}

describe('connect-four dropPiece()', () => {
  it('stacks pieces from the bottom row up', () => {
    let b = empty();
    b = drop(b, 3, 1);
    expect(b[5][3]).toBe(1);
    b = drop(b, 3, 2);
    expect(b[4][3]).toBe(2);
    expect(b[5][3]).toBe(1);
  });

  it('returns null when the column is full', () => {
    let b = empty();
    for (let i = 0; i < ROWS; i++) b = drop(b, 0, 1);
    expect(dropPiece(b, 0, 2)).toBeNull();
  });

  it('does not mutate the input board', () => {
    const b = empty();
    const snapshot = JSON.stringify(b);
    drop(b, 0, 1);
    expect(JSON.stringify(b)).toBe(snapshot);
  });

  it('initial state is empty with player 1 to move', () => {
    const s = createInitialState();
    expect(s.board.every((row) => row.every((c) => c === 0))).toBe(true);
    expect(s.isPlayerTurn).toBe(true);
    expect(s.isGameOver).toBe(false);
  });
});

describe('connect-four checkWin()', () => {
  it('detects horizontal win', () => {
    let b = empty();
    const seq: [number, number][] = [
      [0, 1], [1, 1], [2, 1], [3, 1], [4, 2], [5, 2], [5, 2], [6, 2],
    ];
    for (const [col, p] of seq) b = drop(b, col, p);
    expect(checkWin(b, 1)).toBe(true);
    expect(checkWin(b, 2)).toBe(false);
  });

  it('detects vertical win', () => {
    let b = empty();
    for (let i = 0; i < 4; i++) {
      b = drop(b, 0, 1);
      if (i < 3) b = drop(b, 1, 2);
    }
    expect(checkWin(b, 1)).toBe(true);
    expect(checkWin(b, 2)).toBe(false);
  });

  it('detects up-right diagonal win', () => {
    // Player 1 builds (5,0),(4,1),(3,2),(2,3)
    let b = empty();
    const plan: [number, number][] = [
      [0, 1], [1, 2], [1, 1], [2, 2], [2, 1], [3, 2], [2, 1], [3, 2], [3, 1], [6, 2], [3, 1],
    ];
    for (const [col, p] of plan) b = drop(b, col, p);
    expect(checkWin(b, 1)).toBe(true);
    expect(checkWin(b, 2)).toBe(false);
  });

  it('detects down-left diagonal win', () => {
    // Player 2 builds (5,3),(4,2),(3,1),(2,0)
    let b = empty();
    const plan: [number, number][] = [
      [0, 1], [3, 2], [0, 1], [2, 2], [0, 1], [2, 2], [1, 1], [1, 2], [4, 1], [1, 2], [4, 1], [0, 2],
    ];
    for (const [col, p] of plan) b = drop(b, col, p);
    expect(checkWin(b, 2)).toBe(true);
    expect(checkWin(b, 1)).toBe(false);
  });

  it('no false win on a scattered board', () => {
    const b = drop(drop(empty(), 0, 1), 1, 2);
    expect(checkWin(b, 1)).toBe(false);
    expect(checkWin(b, 2)).toBe(false);
  });
});

describe('connect-four isBoardFull()', () => {
  it('top row full means full', () => {
    let b = empty();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        b = dropPiece(b, c, r % 2 === 0 ? 1 : 2) ?? b;
      }
    }
    expect(isBoardFull(b)).toBe(true);
  });

  it('not full initially', () => {
    expect(isBoardFull(empty())).toBe(false);
  });
});

describe('connect-four evaluation & bot', () => {
  it('rewards center control', () => {
    const withCenter = drop(empty(), 3, 1);
    const offCenter = drop(empty(), 0, 1);
    expect(evaluate(withCenter, 1)).toBeGreaterThan(evaluate(offCenter, 1));
  });

  it('bot takes an immediate winning drop', () => {
    // Bot (2) has three in a row on the bottom row, cols 0-2; col 3 wins
    let b = empty();
    b = drop(b, 0, 2); b = drop(b, 0, 1);
    b = drop(b, 1, 2); b = drop(b, 1, 1);
    b = drop(b, 2, 2); b = drop(b, 2, 1);
    expect(getBestMove(b, 2)).toBe(3);
  });

  it('bot blocks a player three-in-a-row', () => {
    let b = empty();
    b = drop(b, 0, 1); b = drop(b, 0, 2);
    b = drop(b, 1, 1); b = drop(b, 1, 2);
    b = drop(b, 2, 1); b = drop(b, 2, 2);
    // player 1 threatens col 3 on the bottom row; bot must block (no bot win available)
    expect(getBestMove(b, 2)).toBe(3);
  });

  it('bot returns a legal column on an empty board', () => {
    expect(getBestMove(empty(), 2)).toBeGreaterThanOrEqual(0);
    expect(getBestMove(empty(), 2)).toBeLessThan(COLS);
  });
});
