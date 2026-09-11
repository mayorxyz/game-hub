// Shared difficulty system for all games
// Each game interprets these multipliers according to its mechanics

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultySettings {
  // Time-based games: multiplier for time limits (higher = more time)
  timeMultiplier: number;
  
  // Speed-based games: multiplier for game speed (lower = slower)
  speedMultiplier: number;
  
  // Size-based games: multiplier for grid/board size (higher = larger)
  sizeMultiplier: number;
  
  // Complexity-based games: multiplier for complexity (higher = more complex)
  complexityMultiplier: number;
  
  // Score multiplier for balancing difficulty vs reward
  scoreMultiplier: number;
}

export const DIFFICULTY_PRESETS: Record<Difficulty, DifficultySettings> = {
  easy: {
    timeMultiplier: 1.5,
    speedMultiplier: 0.7,
    sizeMultiplier: 0.8,
    complexityMultiplier: 0.7,
    scoreMultiplier: 0.8,
  },
  normal: {
    timeMultiplier: 1.0,
    speedMultiplier: 1.0,
    sizeMultiplier: 1.0,
    complexityMultiplier: 1.0,
    scoreMultiplier: 1.0,
  },
  hard: {
    timeMultiplier: 0.7,
    speedMultiplier: 1.5,
    sizeMultiplier: 1.3,
    complexityMultiplier: 1.5,
    scoreMultiplier: 1.5,
  },
};

export function getDifficultySettings(difficulty: Difficulty): DifficultySettings {
  return DIFFICULTY_PRESETS[difficulty];
}

export function applyDifficulty(
  baseValue: number,
  settings: DifficultySettings,
  type: 'time' | 'speed' | 'size' | 'complexity' | 'score'
): number {
  const multiplier = settings[`${type}Multiplier`];
  return Math.round(baseValue * multiplier);
}
