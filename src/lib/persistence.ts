// Centralized persistence layer for Game Hub
// All localStorage operations go through this module

const NAMESPACE = 'gamehub';

// One-time migration from legacy storage format
function migrateLegacyScores(): void {
  const migratedKey = `${NAMESPACE}.migrated`;
  if (localStorage.getItem(migratedKey)) return;
  
  // Migrate legacy high scores (gamehub_<gameId>_highscore -> gamehub.games.<gameId>.highScore)
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    const match = key.match(/^gamehub_([^_]+)_highscore$/);
    if (match) {
      const gameId = match[1];
      const value = localStorage.getItem(key);
      if (value) {
        const newKey = `${NAMESPACE}.games.${gameId}.highScore`;
        if (!localStorage.getItem(newKey)) {
          localStorage.setItem(newKey, value);
        }
      }
    }
  });
  
  // Migrate legacy recently played
  const legacyRecent = localStorage.getItem('gamehub_recently_played');
  if (legacyRecent) {
    const newKey = `${NAMESPACE}.history.recent`;
    if (!localStorage.getItem(newKey)) {
      localStorage.setItem(newKey, legacyRecent);
    }
  }
  
  localStorage.setItem(migratedKey, 'true');
}

// Run migration on module load
migrateLegacyScores();

// High scores
export function getHighScore(gameId: string): number {
  const key = `${NAMESPACE}.games.${gameId}.highScore`;
  const val = localStorage.getItem(key);
  return val ? parseInt(val, 10) : 0;
}

export function setHighScore(gameId: string, score: number): void {
  const key = `${NAMESPACE}.games.${gameId}.highScore`;
  const current = getHighScore(gameId);
  if (score > current) {
    localStorage.setItem(key, score.toString());
  }
}

// Play count
export function getPlayCount(gameId: string): number {
  const key = `${NAMESPACE}.games.${gameId}.playCount`;
  const val = localStorage.getItem(key);
  return val ? parseInt(val, 10) : 0;
}

export function incrementPlayCount(gameId: string): void {
  const key = `${NAMESPACE}.games.${gameId}.playCount`;
  const count = getPlayCount(gameId);
  localStorage.setItem(key, (count + 1).toString());
}

// Last played
export function getLastPlayed(gameId: string): number | null {
  const key = `${NAMESPACE}.games.${gameId}.lastPlayed`;
  const val = localStorage.getItem(key);
  return val ? parseInt(val, 10) : null;
}

export function setLastPlayed(gameId: string): void {
  const key = `${NAMESPACE}.games.${gameId}.lastPlayed`;
  localStorage.setItem(key, Date.now().toString());
}

// Recently played (list of game IDs)
export function getRecentlyPlayed(): string[] {
  const key = `${NAMESPACE}.history.recent`;
  const val = localStorage.getItem(key);
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function addRecentlyPlayed(gameId: string): void {
  const recent = getRecentlyPlayed().filter(id => id !== gameId);
  recent.unshift(gameId);
  const key = `${NAMESPACE}.history.recent`;
  localStorage.setItem(key, JSON.stringify(recent.slice(0, 10)));
  setLastPlayed(gameId);
  incrementPlayCount(gameId);
}

// Favorites
export function getFavorites(): string[] {
  const key = `${NAMESPACE}.favorites`;
  const val = localStorage.getItem(key);
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function addFavorite(gameId: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    const key = `${NAMESPACE}.favorites`;
    localStorage.setItem(key, JSON.stringify(favorites));
  }
}

export function removeFavorite(gameId: string): void {
  const favorites = getFavorites().filter(id => id !== gameId);
  const key = `${NAMESPACE}.favorites`;
  localStorage.setItem(key, JSON.stringify(favorites));
}

export function isFavorite(gameId: string): boolean {
  return getFavorites().includes(gameId);
}

// Game state (for games that support saving)
export function getGameState(gameId: string): string | null {
  const key = `${NAMESPACE}.games.${gameId}.state`;
  return localStorage.getItem(key);
}

export function setGameState(gameId: string, state: string): void {
  const key = `${NAMESPACE}.games.${gameId}.state`;
  localStorage.setItem(key, state);
}

export function clearGameState(gameId: string): void {
  const key = `${NAMESPACE}.games.${gameId}.state`;
  localStorage.removeItem(key);
}

// Settings
export interface Settings {
  theme: 'system' | 'dark' | 'light';
  showInstructions: boolean;
  confirmRestart: boolean;
  reducedMotion: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  showInstructions: true,
  confirmRestart: true,
  reducedMotion: false,
};

export function getSettings(): Settings {
  const key = `${NAMESPACE}.settings`;
  const val = localStorage.getItem(key);
  if (!val) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(val) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function updateSettings(settings: Partial<Settings>): void {
  const current = getSettings();
  const updated = { ...current, ...settings };
  const key = `${NAMESPACE}.settings`;
  localStorage.setItem(key, JSON.stringify(updated));
}

// Bulk operations
export function clearHistory(): void {
  const key = `${NAMESPACE}.history.recent`;
  localStorage.removeItem(key);
}

export function clearFavorites(): void {
  const key = `${NAMESPACE}.favorites`;
  localStorage.removeItem(key);
}

export function clearAllHighScores(): void {
  const keys = Object.keys(localStorage).filter(k => k.includes('.highScore'));
  keys.forEach(k => localStorage.removeItem(k));
}

export function clearAllGameStates(): void {
  const keys = Object.keys(localStorage).filter(k => k.includes('.state'));
  keys.forEach(k => localStorage.removeItem(k));
}

export function resetAll(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(NAMESPACE));
  keys.forEach(k => localStorage.removeItem(k));
}
