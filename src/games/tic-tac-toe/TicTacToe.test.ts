import { describe, it, expect } from 'vitest';
import {
  checkWinner,
  isBoardFull,
  makeMove,
  getBestMove,
  createInitialState,
  WIN_LINES,
} from './TicTacToe';

describe('tic-tac-toe basics', () => {
  it('has 8 win lines', () => {
    expect(WIN_LINES).toHaveLength(8);
  });

  it('detects row, column and diagonal wins', () => {
    const row = ['X', 'X', 'X', null, 'O', 'O', null, null, null];
    const col = ['X', 'O', null, 'X', 'O', null, 'X', null, null];
    const diag = ['X', 'O', null, null, 'X', null, null, null, 'X'];
    const anti = [null, null, 'X', null, 'X', null, 'X', 'O', 'O'];
    expect(checkWinner(row)).toBe('X');
    expect(checkWinner(col)).toBe('X');
    expect(checkWinner(diag)).toBe('X');
    expect(checkWinner(anti)).toBe('X');
  });

  it('returns null when no winner', () => {
    expect(checkWinner(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'])).toBeNull();
    expect(checkWinner(createInitialState().board)).toBeNull();
  });

  it('isBoardFull', () => {
    expect(isBoardFull(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'])).toBe(true);
    expect(isBoardFull(createInitialState().board)).toBe(false);
  });

  it('makeMove copies the board and places the symbol', () => {
    const board = createInitialState().board;
    const nb = makeMove(board, 4, 'X');
    expect(nb[4]).toBe('X');
    expect(board[4]).toBeNull();
    expect(nb).not.toBe(board);
  });
});

describe('tic-tac-toe bot (minimax)', () => {
  it('plays a guaranteed winning move (blocks X at 2 or wins at 3, both optimal)', () => {
    // X threatens 0,1,2; O owns 4,5.
    // - O3 wins immediately; O2 blocks and still forces a win. Equal minimax
    //   scores (10), so the bot tie-breaks to the lower index (2). Accept both.
    const board = ['X', 'X', null, null, 'O', 'O', null, null, null];
    expect([2, 3]).toContain(getBestMove(board));
  });

  it('blocks an immediate player win when it has no win of its own', () => {
    // X threatens 0,1,2; O has nothing pending -> only optimal move is 2
    const board = ['X', 'X', null, 'O', null, null, null, null, null];
    expect(getBestMove(board)).toBe(2);
  });

  it('keeps the anti-diagonal threat alive (2 or 6 both draw, equal score)', () => {
    // O at 0,4 vs X at 1,3,8. Neither 2 nor 6 wins outright; both lead to a
    // draw with perfect play -> equal score 0, bot tie-breaks to 2.
    const board = ['O', 'X', null, 'X', 'O', null, null, null, 'X'];
    expect([2, 6]).toContain(getBestMove(board));
  });

  it('opens on a corner or center from an empty board', () => {
    const move = getBestMove(createInitialState().board);
    expect([0, 2, 4, 6, 8]).toContain(move);
  });

  it('returns -1 on a full board', () => {
    expect(getBestMove(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'])).toBe(-1);
  });

  it('prefers its own immediate win over blocking', () => {
    // O wins at 5 (score 10); blocking at 8 only draws (score 0) -> 5 strictly better
    const board = [null, null, null, 'O', 'O', null, 'X', 'X', null];
    expect(getBestMove(board)).toBe(5);
  });
});
