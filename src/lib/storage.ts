// Legacy storage module — re-exports from the unified persistence layer
// This ensures all games that import from lib/storage continue to work
// while reading/writing the same data as the features layer.

export {
  getHighScore,
  setHighScore,
  getPlayCount,
  incrementPlayCount,
  getLastPlayed,
  setLastPlayed,
  getRecentlyPlayed,
  addRecentlyPlayed,
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  getGameState,
  setGameState,
  clearGameState,
  getSettings,
  updateSettings,
  clearHistory,
  clearFavorites,
  clearAllHighScores,
  clearAllGameStates,
  resetAll,
} from './persistence';

export type { Settings } from './persistence';
