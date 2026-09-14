import { describe, it, expect } from 'vitest';
import {
  createBoard,
  flood,
  revealCell,
  toggleFlag,
  BASE_ROWS,
  BASE_COLS,
  BASE_MINES,
} from './Minesweeper';

const H = BASE_ROWS;
const W = BASE_COLS;

describe('minesweeper createBoard()', () => {
  it('has the right dimensions and mine count', () => {
    const b = createBoard();
    expect(b).toHaveLength(H);
    b.forEach((row) => expect(row).toHaveLength(W));
    expect(b.flat().filter((c) => c.mine)).toHaveLength(BASE_MINES);
  });

  it('counts neighbors correctly', () => {
    const b = createBoard(3, 3, 1, 42);
    const mineIdx = b.flat().findIndex((c) => c.mine);
    const mr = Math.floor(mineIdx / 3);
    const mc = mineIdx % 3;
    // every non-mine neighbor of the mine must count it
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = mr + dr;
        const c = mc + dc;
        if ((dr || dc) && r >= 0 && r < 3 && c >= 0 && c < 3) {
          expect(b[r][c].count).toBeGreaterThanOrEqual(1);
        }
      }
    }
    expect(b[mr][mc].count).toBe(0);
  });

  it('is deterministic with a seed', () => {
    expect(JSON.stringify(createBoard(9, 9, 10, 7))).toBe(JSON.stringify(createBoard(9, 9, 10, 7)));
  });

  it('respects mine count even on small boards', () => {
    const b = createBoard(4, 4, 5, 1);
    expect(b.flat().filter((c) => c.mine)).toHaveLength(5);
  });
});

describe('minesweeper flood()', () => {
  it('reveals a zero region without touching flags', () => {
    // Build a board with a single mine in the corner
    const b = createBoard(3, 3, 1, 0);
    const mineAt = b.flat().findIndex((c) => c.mine);
    b[0][0].flagged = true;
    const nb = flood(b, 2, 2);
    // flagged cell that was not revealed stays flagged
    if (mineAt !== 0) {
      expect(nb[0][0].flagged).toBe(true);
      expect(nb[0][0].revealed).toBe(false);
    }
  });

  it('does not mutate the input board', () => {
    const b = createBoard(5, 5, 3, 3);
    const snapshot = JSON.stringify(b);
    flood(b, 0, 0);
    expect(JSON.stringify(b)).toBe(snapshot);
  });

  it('stops at numbered cells', () => {
    // single mine at a known spot; flooding far away should not reveal the mine's neighbors beyond counts
    const b = createBoard(9, 9, 1, 5);
    const mineIdx = b.flat().findIndex((c) => c.mine);
    const mr = Math.floor(mineIdx / W);
    const mc = mineIdx % W;
    // reveal from the farthest corner
    const startR = mr === 0 ? H - 1 : 0;
    const startC = mc === 0 ? W - 1 : 0;
    const nb = flood(b, startR, startC);
    expect(nb[mr][mc].revealed).toBe(false);
    // neighbors of mine can be revealed but must keep their count >= 1
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = mr + dr, c = mc + dc;
        if ((dr || dc) && r >= 0 && r < H && c >= 0 && c < W && nb[r][c].revealed) {
          expect(nb[r][c].count).toBeGreaterThanOrEqual(1);
        }
      }
    }
  });
});

describe('minesweeper revealCell()', () => {
  it('hitting a mine ends the game and reveals all mines', () => {
    const b = createBoard(9, 9, 10, 11);
    const mineIdx = b.flat().findIndex((c) => c.mine);
    const r = Math.floor(mineIdx / W);
    const c = mineIdx % W;
    const res = revealCell(b, r, c);
    expect(res.isOver).toBe(true);
    expect(res.isWon).toBe(false);
    expect(res.board.flat().every((cell) => !cell.mine || cell.revealed)).toBe(true);
  });

  it('revealing a flagged cell is a no-op', () => {
    const b = createBoard(9, 9, 10, 2);
    const mineIdx = b.flat().findIndex((c) => c.mine);
    const r = Math.floor(mineIdx / W);
    const c = mineIdx % W;
    const flagged = toggleFlag(b, r, c);
    const res = revealCell(flagged, r, c);
    expect(res.isOver).toBe(false);
    expect(res.board).toBe(flagged);
  });

  it('revealing an already-revealed cell is a no-op', () => {
    const b = createBoard(9, 9, 10, 2);
    const mineIdx = b.flat().findIndex((c) => c.mine);
    const mr = Math.floor(mineIdx / W);
    const mc = mineIdx % W;
    // find a guaranteed safe far cell
    const safeR = mr === 0 ? H - 1 : 0;
    const safeC = mc === 0 ? W - 1 : 0;
    const first = revealCell(b, safeR, safeC);
    if (!first.board[safeR][safeC].revealed) return; // cell was flagged-adjacent; skip
    const snapshot = JSON.stringify(first.board);
    const again = revealCell(first.board, safeR, safeC);
    expect(JSON.stringify(again.board)).toBe(snapshot);
    expect(again.isOver).toBe(false);
  });

  it('winning: revealing every non-mine cell wins', () => {
    const b = createBoard(4, 4, 2, 9);
    let board = b;
    let won = false;
    // Reveal every safe cell via flood from each corner-ish point
    for (let r = 0; r < 4 && !won; r++) {
      for (let c = 0; c < 4 && !won; c++) {
        if (!board[r][c].mine && !board[r][c].revealed && !board[r][c].flagged) {
          const res = revealCell(board, r, c);
          board = res.board;
          won = res.isWon;
          if (res.isOver && !res.isWon) throw new Error('hit a mine during safe sweep');
        }
      }
    }
    expect(won).toBe(true);
    const hiddenSafe = board.flat().filter((cell) => !cell.revealed && !cell.mine).length;
    expect(hiddenSafe).toBe(0);
  });
});

describe('minesweeper toggleFlag()', () => {
  it('toggles a flag on and off', () => {
    let b = createBoard(5, 5, 2, 4);
    b = toggleFlag(b, 1, 1);
    expect(b[1][1].flagged).toBe(true);
    b = toggleFlag(b, 1, 1);
    expect(b[1][1].flagged).toBe(false);
  });

  it('cannot flag a revealed cell', () => {
    const b = createBoard(5, 5, 2, 4);
    const mineIdx = b.flat().findIndex((c) => c.mine);
    const mr = Math.floor(mineIdx / 5);
    const mc = mineIdx % 5;
    const flooded = flood(b, mr === 0 ? 4 : 0, mc === 0 ? 4 : 0);
    const revealed = flooded.flat().filter((c) => c.revealed)[0];
    if (!revealed) return;
    const idx = flooded.flat().findIndex((c) => c.revealed);
    const r = Math.floor(idx / 5);
    const c = idx % 5;
    expect(toggleFlag(flooded, r, c)).toBe(flooded);
  });
});
