export type GameCategory = 'arcade' | 'puzzle' | 'word' | 'strategy' | 'classic';
export type GameMode = 'single' | 'bot' | 'house';
export type GameDifficulty = 'easy' | 'medium' | 'hard';
export type GameGenre = 'action' | 'logic' | 'memory' | 'reflex' | 'board' | 'card';

export interface GameControls {
  keyboard?: string[];
  touch?: string[];
  mouse?: string[];
}

export interface GameInstructions {
  objective: string;
  howToPlay: string[];
  scoring?: string;
  tips?: string[];
}

export interface GameDefinition {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: GameCategory;
  genres: GameGenre[];
  mode: GameMode;
  difficulty: GameDifficulty;
  estimatedPlayTime: string;
  controls: GameControls;
  instructions: GameInstructions;
  accent: string;
  component: React.LazyExoticComponent<React.ComponentType>;
  supportsSave: boolean;
  supportsHighScore: boolean;
  supportsPause: boolean;
  featured: boolean;
  tags: string[];
}
