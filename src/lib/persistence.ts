// Persistence layer for game data

const STORAGE_PREFIX = 'gamehub_';

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
