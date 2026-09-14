// Persistence layer for game data

const STORAGE_PREFIX = 'gamehub_';

function safeReadRaw(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeReadJson<T>(key: string, fallback: T): T {
  const value = safeReadRaw(key);
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeWriteJson<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota / serialization errors
  }
}

export const DATA_CHANGE_EVENT = 'gamehub:datachange';
function notifyChange(): void {
  try {
    window.dispatchEvent(new Event(DATA_CHANGE_EVENT));
  } catch {
    /* ignore */
  }
}

export interface Settings {
  soundEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  theme: 'light' | 'dark' | 'system';
  showInstructions: boolean;
  confirmRestart: boolean;
  reducedMotion: boolean;
  colorblind: boolean;
}

export function getHighScore(gameId: string): number {
  const key = `${STORAGE_PREFIX}${gameId}_highscore`;
  const value = safeReadRaw(key);
  return value ? Number.parseInt(value, 10) || 0 : 0;
}

export function setHighScore(gameId: string, score: number): void {
  const key = `${STORAGE_PREFIX}${gameId}_highscore`;
  const current = getHighScore(gameId);
  if (score > current) {
    try {
      localStorage.setItem(key, score.toString());
    } catch {
      // ignore storage quota / serialization errors
    }
  }
}

export function getGameState(gameId: string): any {
  const key = `${STORAGE_PREFIX}${gameId}_state`;
  const value = safeReadRaw(key);
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && 'v' in parsed && 'data' in parsed) {
      return parsed.data;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setGameState(gameId: string, state: any): void {
  const key = `${STORAGE_PREFIX}${gameId}_state`;
  safeWriteJson(key, { v: 1, data: state });
}

export function clearGameState(gameId: string): void {
  const key = `${STORAGE_PREFIX}${gameId}_state`;
  localStorage.removeItem(key);
}

export function getPlayCount(gameId: string): number {
  const key = `${STORAGE_PREFIX}${gameId}_playcount`;
  const value = safeReadRaw(key);
  return value ? Number.parseInt(value, 10) || 0 : 0;
}

export function incrementPlayCount(gameId: string): void {
  const key = `${STORAGE_PREFIX}${gameId}_playcount`;
  const current = getPlayCount(gameId);
  try {
    localStorage.setItem(key, (current + 1).toString());
  } catch {
    // ignore storage quota / serialization errors
  }
}

export function getLastPlayed(gameId: string): number | null {
  const key = `${STORAGE_PREFIX}${gameId}_lastplayed`;
  const value = safeReadRaw(key);
  return value ? Number.parseInt(value, 10) || null : null;
}

export function setLastPlayed(gameId: string): void {
  const key = `${STORAGE_PREFIX}${gameId}_lastplayed`;
  try {
    localStorage.setItem(key, Date.now().toString());
  } catch {
    // ignore storage quota / serialization errors
  }
}

export function getRecentlyPlayed(): string[] {
  return safeReadJson<string[]>(`${STORAGE_PREFIX}recently_played`, []);
}

export function addRecentlyPlayed(gameId: string): void {
  const recent = getRecentlyPlayed();
  const updated = [gameId, ...recent.filter(id => id !== gameId)].slice(0, 10);
  const key = `${STORAGE_PREFIX}recently_played`;
  safeWriteJson(key, updated);
}

export function getFavorites(): string[] {
  return safeReadJson<string[]>(`${STORAGE_PREFIX}favorites`, []);
}

export function addFavorite(gameId: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(gameId)) {
    favorites.push(gameId);
    const key = `${STORAGE_PREFIX}favorites`;
    safeWriteJson(key, favorites);
  }
}

export function removeFavorite(gameId: string): void {
  const favorites = getFavorites();
  const updated = favorites.filter(id => id !== gameId);
  const key = `${STORAGE_PREFIX}favorites`;
  safeWriteJson(key, updated);
}

export function isFavorite(gameId: string): boolean {
  return getFavorites().includes(gameId);
}

export function getSettings(): Settings {
  const key = `${STORAGE_PREFIX}settings`;
  const fallback: Settings = {
    soundEnabled: true,
    difficulty: 'medium',
    theme: 'dark',
    showInstructions: true,
    confirmRestart: true,
    reducedMotion: false,
    colorblind: false,
  };

  const value = safeReadJson<Partial<Settings> | null>(key, null);
  if (!value) return fallback;

  return {
    ...fallback,
    ...value,
  };
}

export function updateSettings(settings: Partial<Settings>): void {
  const current = getSettings();
  const updated = { ...current, ...settings };
  const key = `${STORAGE_PREFIX}settings`;
  safeWriteJson(key, updated);
  notifyChange();
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
  notifyChange();
}

export function clearAllGameStates(): void {
  const keys = Object.keys(localStorage).filter(key => key.includes('_state'));
  keys.forEach(key => localStorage.removeItem(key));
  notifyChange();
}

export function resetAll(): void {
  const keys = Object.keys(localStorage).filter(key => key.startsWith(STORAGE_PREFIX));
  keys.forEach(key => localStorage.removeItem(key));
  notifyChange();
}

// ─── Game Stats & Results ───────────────────────────────────────────────────

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalScore: number;
  bestStreak: number;
  currentStreak: number;
  perGame: Record<string, {
    plays: number;
    wins: number;
    bestScore: number;
  }>;
}

export function getGameStats(): GameStats {
  const key = `${STORAGE_PREFIX}stats`;
  const fallback: GameStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    bestStreak: 0,
    currentStreak: 0,
    perGame: {},
  };

  const value = safeReadJson<GameStats | null>(key, null);
  if (!value) return fallback;

  return {
    ...fallback,
    ...value,
    perGame: value.perGame ?? {},
  };
}

export function recordGameResult(
  gameId: string,
  result: { won: boolean; score: number; durationMs?: number }
): void {
  const stats = getGameStats();
  
  // Update global stats
  stats.gamesPlayed++;
  if (result.won) {
    stats.gamesWon++;
    stats.currentStreak = (stats.currentStreak ?? 0) + 1;
    if (stats.currentStreak > (stats.bestStreak ?? 0)) {
      stats.bestStreak = stats.currentStreak;
    }
  } else {
    stats.currentStreak = 0;
  }
  stats.totalScore += result.score;
  
  // Update per-game stats
  if (!stats.perGame[gameId]) {
    stats.perGame[gameId] = { plays: 0, wins: 0, bestScore: 0 };
  }
  stats.perGame[gameId].plays++;
  if (result.won) stats.perGame[gameId].wins++;
  if (result.score > stats.perGame[gameId].bestScore) {
    stats.perGame[gameId].bestScore = result.score;
  }
  
  // Also update legacy high score for compatibility
  if (result.score > 0) {
    setHighScore(gameId, result.score);
  }
  
  // Also increment legacy play count
  incrementPlayCount(gameId);
  
  const key = `${STORAGE_PREFIX}stats`;
  localStorage.setItem(key, JSON.stringify(stats));
  notifyChange();
}

// ─── Daily Progress ─────────────────────────────────────────────────────────

export interface DailyProgressEntry {
  gameId: string;
  won: boolean;
  score: number;
}

export function getDailyProgress(): Record<string, DailyProgressEntry> {
  return safeReadJson<Record<string, DailyProgressEntry>>(`${STORAGE_PREFIX}daily_progress`, {});
}

export function setDailyProgress(dateKey: string, entry: DailyProgressEntry): void {
  const progress = getDailyProgress();
  progress[dateKey] = entry;
  const key = `${STORAGE_PREFIX}daily_progress`;
  safeWriteJson(key, progress);
}

// ─── Achievements ───────────────────────────────────────────────────────────

export function getUnlockedAchievements(): string[] {
  return safeReadJson<string[]>(`${STORAGE_PREFIX}achievements`, []);
}

export function unlockAchievement(id: string): void {
  const unlocked = getUnlockedAchievements();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    const key = `${STORAGE_PREFIX}achievements`;
    safeWriteJson(key, unlocked);
    notifyChange();
  }
}

export function isAchievementUnlocked(id: string): boolean {
  return getUnlockedAchievements().includes(id);
}
