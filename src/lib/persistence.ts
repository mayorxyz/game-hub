// Persistence layer for game data

const STORAGE_PREFIX = 'gamehub_';

export interface Settings {
  soundEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: 'light' | 'dark' | 'system';
  showInstructions: boolean;
  confirmRestart: boolean;
  reducedMotion: boolean;
}

export function getHighScore(gameId: string): number {
  const key = `${STORAGE_PREFIX}${gameId}_highscore`;
  const value = localStorage.getItem(key);
  return value ? parseInt(value, 10) : 0;
}

export function setHighScore(gameId: string, score: number): void {
  const key = `${STORAGE_PREFIX}${gameId}_highscore`;
  const current = getHighScore(gameId);
  if (score > current) {
    localStorage.setItem(key, score.toString());
  }
}

export function getGameState(gameId: string): any {
  const key = `${STORAGE_PREFIX}${gameId}_state`;
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

export function setGameState(gameId: string, state: any): void {
  const key = `${STORAGE_PREFIX}${gameId}_state`;
  localStorage.setItem(key, JSON.stringify(state));
}

export function clearGameState(gameId: string): void {
  const key = `${STORAGE_PREFIX}${gameId}_state`;
  localStorage.removeItem(key);
}

export function getPlayCount(gameId: string): number {
  const key = `${STORAGE_PREFIX}${gameId}_playcount`;
  const value = localStorage.getItem(key);
  return value ? parseInt(value, 10) : 0;
}

export function incrementPlayCount(gameId: string): void {
  const key = `${STORAGE_PREFIX}${gameId}_playcount`;
  const current = getPlayCount(gameId);
  localStorage.setItem(key, (current + 1).toString());
}

export function getLastPlayed(gameId: string): number | null {
  const key = `${STORAGE_PREFIX}${gameId}_lastplayed`;
  const value = localStorage.getItem(key);
  return value ? parseInt(value, 10) : null;
}

export function setLastPlayed(gameId: string): void {
  const key = `${STORAGE_PREFIX}${gameId}_lastplayed`;
  localStorage.setItem(key, Date.now().toString());
}

export function getRecentlyPlayed(): string[] {
  const key = `${STORAGE_PREFIX}recently_played`;
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : [];
}

export function addRecentlyPlayed(gameId: string): void {
  const recent = getRecentlyPlayed();
  const updated = [gameId, ...recent.filter(id => id !== gameId)].slice(0, 10);
  const key = `${STORAGE_PREFIX}recently_played`;
  localStorage.setItem(key, JSON.stringify(updated));
}

export function getFavorites(): string[] {
  const key = `${STORAGE_PREFIX}favorites`;
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : [];
}

export function addFavorite(gameId: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    const key = `${STORAGE_PREFIX}favorites`;
    localStorage.setItem(key, JSON.stringify(favorites));
  }
}

export function removeFavorite(gameId: string): void {
  const favorites = getFavorites();
  const updated = favorites.filter(id => id !== gameId);
  const key = `${STORAGE_PREFIX}favorites`;
  localStorage.setItem(key, JSON.stringify(updated));
}

export function isFavorite(gameId: string): boolean {
  return getFavorites().includes(gameId);
}

export function getSettings(): Settings {
  const key = `${STORAGE_PREFIX}settings`;
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : { 
    soundEnabled: true, 
    difficulty: 'medium', 
    theme: 'dark',
    showInstructions: true,
    confirmRestart: true,
    reducedMotion: false
  };
}

export function updateSettings(settings: Partial<Settings>): void {
  const current = getSettings();
  const updated = { ...current, ...settings };
  const key = `${STORAGE_PREFIX}settings`;
  localStorage.setItem(key, JSON.stringify(updated));
}

export function clearHistory(): void {
  const key = `${STORAGE_PREFIX}recently_played`;
  localStorage.removeItem(key);
}

export function clearFavorites(): void {
  const key = `${STORAGE_PREFIX}favorites`;
  localStorage.removeItem(key);
}

export function clearAllHighScores(): void {
  const keys = Object.keys(localStorage).filter(key => key.includes('_highscore'));
  keys.forEach(key => localStorage.removeItem(key));
}

export function clearAllGameStates(): void {
  const keys = Object.keys(localStorage).filter(key => key.includes('_state'));
  keys.forEach(key => localStorage.removeItem(key));
}

export function resetAll(): void {
  const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_PREFIX));
  keys.forEach(key => localStorage.removeItem(key));
}
