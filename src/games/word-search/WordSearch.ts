// Pure game logic for Word Search - no React, no UI, no input handling

export const WORDS = ['REACT', 'TYPESCRIPT', 'PUZZLE', 'SEARCH', 'CODING', 'BROWSER', 'KEYBOARD', 'FUNCTION'];
export const GRID_SIZE = 10;

export interface WordSearchState {
  grid: string[][];
  positions: Map<string, [number, number][]>;
  found: Set<string>;
  isWon: boolean;
}

export function generateGrid(words: string[]): { grid: string[][]; positions: Map<string, [number, number][]> } {
  const grid: string[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  const positions = new Map<string, [number, number][]>();
  const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]];

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * GRID_SIZE);
      const c = Math.floor(Math.random() * GRID_SIZE);
      const endR = r + dir[0] * (word.length - 1);
      const endC = c + dir[1] * (word.length - 1);
      if (endR < 0 || endR >= GRID_SIZE || endC < 0 || endC >= GRID_SIZE) continue;

      let canPlace = true;
      const pos: [number, number][] = [];
      for (let i = 0; i < word.length; i++) {
        const cr = r + dir[0] * i, cc = c + dir[1] * i;
        if (grid[cr][cc] !== '' && grid[cr][cc] !== word[i]) {
          canPlace = false;
          break;
        }
        pos.push([cr, cc]);
      }
      if (canPlace) {
        pos.forEach(([pr, pc], i) => {
          grid[pr][pc] = word[i];
        });
        positions.set(word, pos);
        placed = true;
      }
    }
  }

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }
  return { grid, positions };
}

export function createInitialState(): WordSearchState {
  const { grid, positions } = generateGrid(WORDS);
  return {
    grid,
    positions,
    found: new Set(),
    isWon: false,
  };
}

export function findWord(state: WordSearchState, word: string): WordSearchState {
  if (state.found.has(word)) return state;
  
  const newFound = new Set(state.found);
  newFound.add(word);
  const isWon = newFound.size === WORDS.length;
  
  return {
    ...state,
    found: newFound,
    isWon,
  };
}

export function resetGame(): WordSearchState {
  return createInitialState();
}
