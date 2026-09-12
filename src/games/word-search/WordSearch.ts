// Pure game logic for Word Search - no React, no UI, no input handling
import { mulberry32 } from '../../lib/random';

export const WORDS = ['REACT', 'TYPESCRIPT', 'PUZZLE', 'SEARCH', 'CODING', 'BROWSER', 'KEYBOARD', 'FUNCTION'];
export const GRID_SIZE = 10;

export interface WordSearchState {
  grid: string[][];
  positions: Map<string, [number, number][]>;
  found: Set<string>;
  isWon: boolean;
  words: string[];
}

export function generateGrid(words: string[], seed?: number, gridSize: number = GRID_SIZE): { grid: string[][]; positions: Map<string, [number, number][]> } {
  const grid: string[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(''));
  const positions = new Map<string, [number, number][]>();
  const dirs = [[0, 1], [1, 0], [1, 1], [-1, 1]];
  const rng = seed !== undefined ? mulberry32(seed) : Math.random;

  for (const word of words) {
    let placed = false;
    for (let attempt = 0; attempt < 100 && !placed; attempt++) {
      const dir = dirs[Math.floor(rng() * dirs.length)];
      const r = Math.floor(rng() * gridSize);
      const c = Math.floor(rng() * gridSize);
      const endR = r + dir[0] * (word.length - 1);
      const endC = c + dir[1] * (word.length - 1);
      if (endR < 0 || endR >= gridSize || endC < 0 || endC >= gridSize) continue;

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

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = String.fromCharCode(65 + Math.floor(rng() * 26));
      }
    }
  }
  return { grid, positions };
}

export function createInitialState(seed?: number, gridSize: number = GRID_SIZE, wordCount: number = WORDS.length): WordSearchState {
  const words = WORDS.slice(0, Math.max(1, Math.min(wordCount, WORDS.length)));
  // The grid has to be at least as long as the longest word it hides.
  const size = Math.max(gridSize, ...words.map(w => w.length));
  const { grid, positions } = generateGrid(words, seed, size);
  return {
    grid,
    positions,
    found: new Set(),
    isWon: false,
    words,
  };
}

export function findWord(state: WordSearchState, word: string): WordSearchState {
  if (state.found.has(word)) return state;
  
  const newFound = new Set(state.found);
  newFound.add(word);
  const isWon = newFound.size === state.words.length;
  
  return {
    ...state,
    found: newFound,
    isWon,
  };
}

export function resetGame(seed?: number, gridSize: number = GRID_SIZE, wordCount: number = WORDS.length): WordSearchState {
  return createInitialState(seed, gridSize, wordCount);
}
