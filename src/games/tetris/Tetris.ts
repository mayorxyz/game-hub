// Pure game logic for Tetris - no React, no UI, no input handling

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  type: TetrominoType;
  shape: number[][];
  position: Position;
  rotation: number;
}

export interface TetrisState {
  board: (TetrominoType | null)[][];
  currentPiece: Piece | null;
  nextPiece: Piece | null;
  score: number;
  lines: number;
  level: number;
  isRunning: boolean;
  isGameOver: boolean;
  isPaused: boolean;
}

// Tetromino shapes (4 rotations each)
const TETROMINOES: Record<TetrominoType, number[][][]> = {
  I: [
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
    [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
    [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]],
  ],
  O: [
    [[1,1], [1,1]],
    [[1,1], [1,1]],
    [[1,1], [1,1]],
    [[1,1], [1,1]],
  ],
  T: [
    [[0,1,0], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,1], [0,1,0]],
    [[0,1,0], [1,1,0], [0,1,0]],
  ],
  S: [
    [[0,1,1], [1,1,0], [0,0,0]],
    [[0,1,0], [0,1,1], [0,0,1]],
    [[0,0,0], [0,1,1], [1,1,0]],
    [[1,0,0], [1,1,0], [0,1,0]],
  ],
  Z: [
    [[1,1,0], [0,1,1], [0,0,0]],
    [[0,0,1], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,0], [0,1,1]],
    [[0,1,0], [1,1,0], [1,0,0]],
  ],
  J: [
    [[1,0,0], [1,1,1], [0,0,0]],
    [[0,1,1], [0,1,0], [0,1,0]],
    [[0,0,0], [1,1,1], [0,0,1]],
    [[0,1,0], [0,1,0], [1,1,0]],
  ],
  L: [
    [[0,0,1], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,0], [0,1,1]],
    [[0,0,0], [1,1,1], [1,0,0]],
    [[1,1,0], [0,1,0], [0,1,0]],
  ],
};

export function createEmptyBoard(): (TetrominoType | null)[][] {
  return Array.from({ length: BOARD_HEIGHT }, () => 
    Array(BOARD_WIDTH).fill(null)
  );
}

export function createPiece(type: TetrominoType): Piece {
  return {
    type,
    shape: TETROMINOES[type][0],
    position: { x: Math.floor(BOARD_WIDTH / 2) - 2, y: 0 },
    rotation: 0,
  };
}

export function getRandomTetromino(): TetrominoType {
  const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  return types[Math.floor(Math.random() * types.length)];
}

export function createInitialState(): TetrisState {
  return {
    board: createEmptyBoard(),
    currentPiece: createPiece(getRandomTetromino()),
    nextPiece: createPiece(getRandomTetromino()),
    score: 0,
    lines: 0,
    level: 1,
    isRunning: false,
    isGameOver: false,
    isPaused: false,
  };
}

export function isValidPosition(
  board: (TetrominoType | null)[][],
  piece: Piece,
  offsetX: number = 0,
  offsetY: number = 0
): boolean {
  for (let y = 0; y < piece.shape.length; y++) {
    for (let x = 0; x < piece.shape[y].length; x++) {
      if (piece.shape[y][x]) {
        const newX = piece.position.x + x + offsetX;
        const newY = piece.position.y + y + offsetY;
        
        if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
          return false;
        }
        
        if (newY >= 0 && board[newY][newX] !== null) {
          return false;
        }
      }
    }
  }
  return true;
}

export function rotatePiece(piece: Piece): Piece {
  const newRotation = (piece.rotation + 1) % 4;
  return {
    ...piece,
    shape: TETROMINOES[piece.type][newRotation],
    rotation: newRotation,
  };
}

export function movePiece(piece: Piece, dx: number, dy: number): Piece {
  return {
    ...piece,
    position: {
      x: piece.position.x + dx,
      y: piece.position.y + dy,
    },
  };
}

export function lockPiece(state: TetrisState): TetrisState {
  if (!state.currentPiece) return state;

  const newBoard = state.board.map(row => [...row]);
  
  // Place piece on board
  for (let y = 0; y < state.currentPiece.shape.length; y++) {
    for (let x = 0; x < state.currentPiece.shape[y].length; x++) {
      if (state.currentPiece.shape[y][x]) {
        const boardY = state.currentPiece.position.y + y;
        const boardX = state.currentPiece.position.x + x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newBoard[boardY][boardX] = state.currentPiece.type;
        }
      }
    }
  }

  // Check for completed lines
  let linesCleared = 0;
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    if (newBoard[y].every(cell => cell !== null)) {
      newBoard.splice(y, 1);
      newBoard.unshift(Array(BOARD_WIDTH).fill(null));
      linesCleared++;
      y++; // Re-check this line
    }
  }

  // Calculate score
  const lineScores = [0, 100, 300, 500, 800];
  const newScore = state.score + (lineScores[linesCleared] || 0) * state.level;
  const newLines = state.lines + linesCleared;
  const newLevel = Math.floor(newLines / 10) + 1;

  // Spawn new piece
  const newPiece = state.nextPiece || createPiece(getRandomTetromino());
  const nextPiece = createPiece(getRandomTetromino());

  // Check game over
  const isGameOver = !isValidPosition(newBoard, newPiece);

  return {
    ...state,
    board: newBoard,
    currentPiece: newPiece,
    nextPiece: nextPiece,
    score: newScore,
    lines: newLines,
    level: newLevel,
    isGameOver,
  };
}

export function tick(state: TetrisState): TetrisState {
  if (state.isGameOver || state.isPaused || !state.currentPiece) return state;

  const movedPiece = movePiece(state.currentPiece, 0, 1);
  
  if (isValidPosition(state.board, movedPiece)) {
    return {
      ...state,
      currentPiece: movedPiece,
    };
  } else {
    return lockPiece(state);
  }
}
