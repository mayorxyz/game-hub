// Pure game logic for Minesweeper - no React, no UI, no input handling

export const BASE_ROWS = 9;
export const BASE_COLS = 9;
export const BASE_MINES = 10;

export interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  count: number;
}

export type Board = Cell[][];

export interface MinesweeperState {
  board: Board;
  isOver: boolean;
  isWon: boolean;
  time: number;
  isRunning: boolean;
  flagMode: boolean;
}

export function createBoard(rows: number = BASE_ROWS, cols: number = BASE_COLS, mines: number = BASE_MINES): Board {
  const b: Board = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      count: 0,
    }))
  );
  let p = 0;
  while (p < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (!b[r][c].mine) {
      b[r][c].mine = true;
      p++;
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (b[r][c].mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && b[nr][nc].mine) n++;
        }
      }
      b[r][c].count = n;
    }
  }
  return b;
}

export function createInitialState(): MinesweeperState {
  return {
    board: createBoard(),
    isOver: false,
    isWon: false,
    time: 0,
    isRunning: false,
    flagMode: false,
  };
}

export function flood(board: Board, r: number, c: number): Board {
  const nb = board.map(row => row.map(cell => ({ ...cell })));
  const rows = board.length;
  const cols = board[0].length;
  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [cr, cc] = stack.pop()!;
    if (cr < 0 || cr >= rows || cc < 0 || cc >= cols || nb[cr][cc].revealed || nb[cr][cc].flagged) continue;
    nb[cr][cc].revealed = true;
    if (nb[cr][cc].count === 0 && !nb[cr][cc].mine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr || dc) stack.push([cr + dr, cc + dc]);
        }
      }
    }
  }
  return nb;
}

export function revealCell(board: Board, r: number, c: number): { board: Board; isOver: boolean; isWon: boolean } {
  if (board[r][c].flagged || board[r][c].revealed) {
    return { board, isOver: false, isWon: false };
  }
  if (board[r][c].mine) {
    const newBoard = board.map(row =>
      row.map(cell => ({ ...cell, revealed: cell.mine ? true : cell.revealed }))
    );
    return { board: newBoard, isOver: true, isWon: false };
  }
  const newBoard = flood(board, r, c);
  const isWon = newBoard.flat().filter(c => !c.revealed && !c.mine).length === 0;
  return { board: newBoard, isOver: false, isWon };
}

export function toggleFlag(board: Board, r: number, c: number): Board {
  if (board[r][c].revealed) return board;
  return board.map((row, ri) =>
    row.map((cell, ci) => (ri === r && ci === c ? { ...cell, flagged: !cell.flagged } : cell))
  );
}

export function resetGame(): MinesweeperState {
  return createInitialState();
}
