import { describe, it, expect } from 'vitest';
import {
  slide,
  move,
  hasValidMoves,
  createBoard,
  addRandom,
  createInitialState,
  BOARD_SIZE,
} from './Game2048';

describe('2048 slide()', () => {
  it('slides tiles left and fills with zeros', () => {
    expect(slide([2, 0, 4, 0]).row).toEqual([2, 4, 0, 0]);
    expect(slide([2, 0, 4, 0]).score).toBe(0);
  });

  it('merges equal adjacent tiles once per move', () => {
    expect(slide([2, 2, 2, 2]).row).toEqual([4, 4, 0, 0]);
    expect(slide([2, 2, 2, 2]).score).toBe(8);
  });

  it('does not double-merge a tile created by a merge', () => {
    // [4,2,2,0] -> merge 2+2 -> [4,4] which must NOT re-merge to 8
    expect(slide([4, 2, 2, 0]).row).toEqual([4, 4, 0, 0]);
  });

  it('scores merges correctly', () => {
    expect(slide([4, 4, 8, 8]).score).toBe(8 + 16);
  });

  it('leaves an empty row empty', () => {
    expect(slide([0, 0, 0, 0]).row).toEqual([0, 0, 0, 0]);
  });
});

describe('2048 move()', () => {
  it('moves everything left without merging', () => {
    const board = [
      [0, 2, 0, 4],
      [0, 0, 0, 0],
      [0, 8, 0, 0],
      [0, 0, 0, 16],
    ];
    const { board: nb, moved, score } = move(board, 'left');
    expect(nb[0]).toEqual([2, 4, 0, 0]);
    expect(nb[2][0]).toBe(8);
    expect(nb[3][0]).toBe(16);
    expect(moved).toBe(true);
    expect(score).toBe(0);
  });

  it('merges towards the move direction (right)', () => {
    // Implementation slides left then reverses: [2,2,4] -> [4,4] -> reversed [0,0,4,4]
    const board = [
      [2, 2, 4, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const { board: nb, score } = move(board, 'right');
    expect(nb[0]).toEqual([0, 0, 4, 4]);
    expect(score).toBe(4); // one merge: 2+2 -> 4; the existing 4 does not re-merge
  });

  it('moves and merges vertically (up)', () => {
    const board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [4, 0, 0, 0],
      [4, 0, 0, 0],
    ];
    const { board: nb, score } = move(board, 'up');
    expect(nb.map((r) => r[0])).toEqual([4, 8, 0, 0]);
    expect(score).toBe(12);
  });

  it('moves and merges vertically (down)', () => {
    const board = [
      [2, 0, 0, 0],
      [2, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const { board: nb, score } = move(board, 'down');
    expect(nb.map((r) => r[0])).toEqual([0, 0, 0, 4]);
    expect(score).toBe(4);
  });

  it('reports moved=false when nothing changes', () => {
    const board = [
      [2, 4, 8, 16],
      [16, 8, 4, 2],
      [2, 4, 8, 16],
      [16, 8, 4, 2],
    ];
    expect(move(board, 'left').moved).toBe(false);
    expect(move(board, 'right').moved).toBe(false);
    expect(move(board, 'up').moved).toBe(false);
    expect(move(board, 'down').moved).toBe(false);
  });

  it('does not mutate the input board', () => {
    const board = [
      [2, 2, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    const snapshot = JSON.stringify(board);
    move(board, 'left');
    move(board, 'up');
    expect(JSON.stringify(board)).toBe(snapshot);
  });
});

describe('2048 hasValidMoves()', () => {
  it('true when an empty cell exists', () => {
    const board = createBoard();
    expect(hasValidMoves(board)).toBe(true);
  });

  it('true when adjacent merge is possible on a full board', () => {
    const board = [
      [2, 4, 8, 16],
      [16, 8, 4, 2],
      [2, 4, 8, 16],
      [16, 8, 4, 4],
    ];
    expect(hasValidMoves(board)).toBe(true);
  });

  it('false on a full board with no adjacent equals', () => {
    const board = [
      [2, 4, 8, 16],
      [16, 8, 4, 2],
      [2, 4, 8, 16],
      [16, 8, 4, 2],
    ];
    expect(hasValidMoves(board)).toBe(false);
  });
});

describe('2048 randomness / init', () => {
  it('addRandom fills exactly one empty cell', () => {
    const board = createBoard();
    const nb = addRandom(board);
    expect(nb.flat().filter((v) => v !== 0)).toHaveLength(1);
    expect(nb.flat().every((v) => v === 2 || v === 4 || v === 0)).toBe(true);
  });

  it('addRandom never mutates its input', () => {
    const board = createBoard();
    const snapshot = JSON.stringify(board);
    addRandom(board);
    expect(JSON.stringify(board)).toBe(snapshot);
  });

  it('seeded init is deterministic', () => {
    const a = createInitialState(42);
    const b = createInitialState(42);
    expect(a.board).toEqual(b.board);
    expect(a.score).toBe(0);
    expect(a.isGameOver).toBe(false);
  });

  it('seeded init places the requested number of tiles', () => {
    expect(createInitialState(7).board.flat().filter((v) => v !== 0)).toHaveLength(2);
    expect(createInitialState(7, 4).board.flat().filter((v) => v !== 0)).toHaveLength(4);
  });

  it('board size is 4x4', () => {
    expect(BOARD_SIZE).toBe(4);
    createInitialState(1).board.forEach((row) => expect(row).toHaveLength(4));
  });
});
