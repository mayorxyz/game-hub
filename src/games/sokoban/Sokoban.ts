// Pure game logic for Sokoban - no React, no UI, no input handling

export type Level = string[];

export interface ParsedLevel {
  walls: boolean[][];
  targets: Set<string>;
  boxes: Set<string>;
  player: [number, number];
  rows: number;
  cols: number;
}

export interface SokobanState {
  levelIndex: number;
  boxes: Set<string>;
  player: [number, number];
  moves: number;
  isWon: boolean;
}

// Levels are ordered from easiest to hardest; the UI picks one by difficulty.
export const LEVELS: Level[] = [
  // Easy: two boxes, short pushes.
  [
    '########',
    '#      #',
    '#  .   #',
    '#  $   #',
    '#  @   #',
    '#   $  #',
    '#  .   #',
    '########',
  ],
  // Medium: the original warehouse layout.
  ['  ####  ', '###..###', '#..$.*.#', '#..$.###', '#.@.##  ', '#.####  ', '####    '],
  // Hard: four boxes that have to be walked around the dividing walls.
  [
    '##########',
    '#        #',
    '#  .  .  #',
    '#  $  $  #',
    '#        #',
    '#  .  .  #',
    '#  $  $  #',
    '#   @    #',
    '##########',
  ],
];

export function parseLevel(level: Level): ParsedLevel {
  const rows = level.length;
  const cols = Math.max(...level.map(r => r.length));
  const walls: boolean[][] = Array.from({ length: rows }, () => Array(cols).fill(false));
  const targets = new Set<string>();
  const boxes = new Set<string>();
  let player: [number, number] = [0, 0];

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < level[r].length; c++) {
      const ch = level[r][c];
      if (ch === '#') walls[r][c] = true;
      else if (ch === '.') targets.add(`${r},${c}`);
      else if (ch === '$') boxes.add(`${r},${c}`);
      else if (ch === '*') {
        targets.add(`${r},${c}`);
        boxes.add(`${r},${c}`);
      }
      else if (ch === '@') player = [r, c];
      else if (ch === '+') {
        player = [r, c];
        targets.add(`${r},${c}`);
      }
    }
  }

  return { walls, targets, boxes, player, rows, cols };
}

export function createInitialState(levelIndex: number = 0): SokobanState {
  const parsed = parseLevel(LEVELS[levelIndex]);
  return {
    levelIndex,
    boxes: new Set(parsed.boxes),
    player: parsed.player,
    moves: 0,
    isWon: false,
  };
}

export function checkWin(parsed: ParsedLevel, boxes: Set<string>): boolean {
  return [...parsed.targets].every(t => boxes.has(t));
}

export function checkMove(
  parsed: ParsedLevel,
  player: [number, number],
  dr: number,
  dc: number,
  boxes: Set<string>
): { canMove: boolean; canPush: boolean; newBoxPos?: string } {
  const [pr, pc] = player;
  const nr = pr + dr;
  const nc = pc + dc;

  if (nr < 0 || nr >= parsed.rows || nc < 0 || nc >= parsed.cols || parsed.walls[nr][nc]) {
    return { canMove: false, canPush: false };
  }

  const k = `${nr},${nc}`;
  if (boxes.has(k)) {
    const br = nr + dr;
    const bc = nc + dc;
    if (br < 0 || br >= parsed.rows || bc < 0 || bc >= parsed.cols || parsed.walls[br][bc] || boxes.has(`${br},${bc}`)) {
      return { canMove: false, canPush: false };
    }
    return { canMove: true, canPush: true, newBoxPos: `${br},${bc}` };
  }

  return { canMove: true, canPush: false };
}

export function applyMove(
  state: SokobanState,
  parsed: ParsedLevel,
  dr: number,
  dc: number
): SokobanState {
  const { canMove, canPush, newBoxPos } = checkMove(parsed, state.player, dr, dc, state.boxes);
  
  if (!canMove) return state;

  const [pr, pc] = state.player;
  const nr = pr + dr;
  const nc = pc + dc;

  const newBoxes = new Set(state.boxes);
  if (canPush && newBoxPos) {
    const k = `${nr},${nc}`;
    newBoxes.delete(k);
    newBoxes.add(newBoxPos);
  }

  const isWon = checkWin(parsed, newBoxes);

  return {
    ...state,
    boxes: newBoxes,
    player: [nr, nc],
    moves: state.moves + 1,
    isWon,
  };
}
