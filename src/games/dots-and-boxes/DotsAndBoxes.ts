// Pure game logic for Dots and Boxes - no React, no UI, no input handling

export const GRID_SIZE = 5; // 5x5 dots = 4x4 boxes

export interface DotsAndBoxesState {
  horizontalLines: boolean[][]; // (GRID_SIZE) x (GRID_SIZE - 1)
  verticalLines: boolean[][];   // (GRID_SIZE - 1) x (GRID_SIZE)
  boxes: (0 | 1 | 2 | null)[][]; // 0 = empty, 1 = player 1, 2 = player 2, null = not completed
  currentPlayer: 1 | 2;
  player1Score: number;
  player2Score: number;
  isGameOver: boolean;
}

export function createInitialState(gridSize: number = GRID_SIZE): DotsAndBoxesState {
  return {
    horizontalLines: Array.from({ length: gridSize }, () => 
      Array(gridSize - 1).fill(false)
    ),
    verticalLines: Array.from({ length: gridSize - 1 }, () => 
      Array(gridSize).fill(false)
    ),
    boxes: Array.from({ length: gridSize - 1 }, () => 
      Array(gridSize - 1).fill(null)
    ),
    currentPlayer: 1,
    player1Score: 0,
    player2Score: 0,
    isGameOver: false,
  };
}

export function placeHorizontalLine(
  state: DotsAndBoxesState,
  row: number,
  col: number
): DotsAndBoxesState {
  if (state.isGameOver || state.horizontalLines[row][col]) return state;

  const newHorizontalLines = state.horizontalLines.map(row => [...row]);
  newHorizontalLines[row][col] = true;

  const newState = checkCompletedBoxes(
    { ...state, horizontalLines: newHorizontalLines },
    'horizontal',
    row,
    col
  );

  // If no box was completed, switch player
  if (newState.player1Score === state.player1Score && 
      newState.player2Score === state.player2Score) {
    return {
      ...newState,
      currentPlayer: state.currentPlayer === 1 ? 2 : 1,
    };
  }

  return newState;
}

export function placeVerticalLine(
  state: DotsAndBoxesState,
  row: number,
  col: number
): DotsAndBoxesState {
  if (state.isGameOver || state.verticalLines[row][col]) return state;

  const newVerticalLines = state.verticalLines.map(row => [...row]);
  newVerticalLines[row][col] = true;

  const newState = checkCompletedBoxes(
    { ...state, verticalLines: newVerticalLines },
    'vertical',
    row,
    col
  );

  // If no box was completed, switch player
  if (newState.player1Score === state.player1Score && 
      newState.player2Score === state.player2Score) {
    return {
      ...newState,
      currentPlayer: state.currentPlayer === 1 ? 2 : 1,
    };
  }

  return newState;
}

function checkCompletedBoxes(
  state: DotsAndBoxesState,
  lineType: 'horizontal' | 'vertical',
  lineRow: number,
  lineCol: number
): DotsAndBoxesState {
  const newBoxes = state.boxes.map(row => [...row]);
  let player1Score = state.player1Score;
  let player2Score = state.player2Score;
  let boxCompleted = false;

  // Number of dots per side (the board size is derived from the state).
  const size = state.horizontalLines.length;

  // Check boxes adjacent to the placed line
  if (lineType === 'horizontal') {
    // Check box above (if exists)
    if (lineRow > 0) {
      const boxRow = lineRow - 1;
      const boxCol = lineCol;
      if (newBoxes[boxRow][boxCol] === null && isBoxComplete(state, boxRow, boxCol)) {
        newBoxes[boxRow][boxCol] = state.currentPlayer;
        if (state.currentPlayer === 1) player1Score++;
        else player2Score++;
        boxCompleted = true;
      }
    }
    // Check box below (if exists)
    if (lineRow < size - 1) {
      const boxRow = lineRow;
      const boxCol = lineCol;
      if (newBoxes[boxRow][boxCol] === null && isBoxComplete(state, boxRow, boxCol)) {
        newBoxes[boxRow][boxCol] = state.currentPlayer;
        if (state.currentPlayer === 1) player1Score++;
        else player2Score++;
        boxCompleted = true;
      }
    }
  } else {
    // Check box to the left (if exists)
    if (lineCol > 0) {
      const boxRow = lineRow;
      const boxCol = lineCol - 1;
      if (newBoxes[boxRow][boxCol] === null && isBoxComplete(state, boxRow, boxCol)) {
        newBoxes[boxRow][boxCol] = state.currentPlayer;
        if (state.currentPlayer === 1) player1Score++;
        else player2Score++;
        boxCompleted = true;
      }
    }
    // Check box to the right (if exists)
    if (lineCol < size - 1) {
      const boxRow = lineRow;
      const boxCol = lineCol;
      if (newBoxes[boxRow][boxCol] === null && isBoxComplete(state, boxRow, boxCol)) {
        newBoxes[boxRow][boxCol] = state.currentPlayer;
        if (state.currentPlayer === 1) player1Score++;
        else player2Score++;
        boxCompleted = true;
      }
    }
  }

  // Check if game is over
  const isGameOver = newBoxes.every(row => row.every(box => box !== null));

  return {
    ...state,
    boxes: newBoxes,
    player1Score,
    player2Score,
    isGameOver,
  };
}

function isBoxComplete(state: DotsAndBoxesState, boxRow: number, boxCol: number): boolean {
  // Check all 4 sides of the box
  const top = state.horizontalLines[boxRow][boxCol];
  const bottom = state.horizontalLines[boxRow + 1][boxCol];
  const left = state.verticalLines[boxRow][boxCol];
  const right = state.verticalLines[boxRow][boxCol + 1];

  return top && bottom && left && right;
}

export function getWinner(state: DotsAndBoxesState): 1 | 2 | 'tie' | null {
  if (!state.isGameOver) return null;
  
  if (state.player1Score > state.player2Score) return 1;
  if (state.player2Score > state.player1Score) return 2;
  return 'tie';
}

export interface LineMove {
  type: 'horizontal' | 'vertical';
  row: number;
  col: number;
}

function applyMove(state: DotsAndBoxesState, move: LineMove): DotsAndBoxesState {
  return move.type === 'horizontal'
    ? placeHorizontalLine(state, move.row, move.col)
    : placeVerticalLine(state, move.row, move.col);
}

function boxSideCount(state: DotsAndBoxesState, boxRow: number, boxCol: number): number {
  const top = state.horizontalLines[boxRow][boxCol];
  const bottom = state.horizontalLines[boxRow + 1][boxCol];
  const left = state.verticalLines[boxRow][boxCol];
  const right = state.verticalLines[boxRow][boxCol + 1];
  return (top ? 1 : 0) + (bottom ? 1 : 0) + (left ? 1 : 0) + (right ? 1 : 0);
}

// Greedy bot for player 2: takes boxes it can complete, otherwise plays the
// safest move (avoiding leaving any box with 3 sides for the opponent).
export function getBotMove(state: DotsAndBoxesState): LineMove | null {
  if (state.isGameOver) return null;

  const size = state.horizontalLines.length;
  const moves: LineMove[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size - 1; c++) {
      if (!state.horizontalLines[r][c]) moves.push({ type: 'horizontal', row: r, col: c });
    }
  }
  for (let r = 0; r < size - 1; r++) {
    for (let c = 0; c < size; c++) {
      if (!state.verticalLines[r][c]) moves.push({ type: 'vertical', row: r, col: c });
    }
  }
  if (moves.length === 0) return null;

  const before = state.player1Score + state.player2Score;
  const scored = moves.map(move => {
    const next = applyMove(state, move);
    const gained = next.player1Score + next.player2Score - before;
    return { move, gained, next };
  });

  // 1. Complete a box if possible.
  const completing = scored.filter(x => x.gained > 0);
  if (completing.length > 0) return completing[0].move;

  // 2. Prefer moves that don't hand the opponent a box.
  const safe = scored.filter(x => {
    for (let r = 0; r < size - 1; r++) {
      for (let c = 0; c < size - 1; c++) {
        if (x.next.boxes[r][c] === null && boxSideCount(x.next, r, c) === 3) return false;
      }
    }
    return true;
  });
  const pool = safe.length > 0 ? safe : scored;
  return pool[Math.floor(Math.random() * pool.length)].move;
}
