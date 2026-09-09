// High scores
export function getHighScore(gameId: string): number {
  const key = `gamehub_${gameId}_highscore`;
  const val = localStorage.getItem(key);
  return val ? parseInt(val, 10) : 0;
}

export function setHighScore(gameId: string, score: number): void {
  const key = `gamehub_${gameId}_highscore`;
  const current = getHighScore(gameId);
  if (score > current) {
    localStorage.setItem(key, score.toString());
  }
}

// Recently played
export function getRecentlyPlayed(): string[] {
  const val = localStorage.getItem('gamehub_recently_played');
  return val ? JSON.parse(val) : [];
}

export function addRecentlyPlayed(gameId: string): void {
  const recent = getRecentlyPlayed().filter(id => id !== gameId);
  recent.unshift(gameId);
  localStorage.setItem('gamehub_recently_played', JSON.stringify(recent.slice(0, 8)));
}

// Play count
export function getPlayCount(gameId: string): number {
  const val = localStorage.getItem(`gamehub_${gameId}_plays`);
  return val ? parseInt(val, 10) : 0;
}

export function incrementPlayCount(gameId: string): void {
  const count = getPlayCount(gameId);
  localStorage.setItem(`gamehub_${gameId}_plays`, (count + 1).toString());
}

// Game state
export function getGameState(gameId: string): string | null {
  return localStorage.getItem(`gamehub_${gameId}_state`);
}

export function setGameState(gameId: string, state: string): void {
  localStorage.setItem(`gamehub_${gameId}_state`, state);
}

export function clearGameState(gameId: string): void {
  localStorage.removeItem(`gamehub_${gameId}_state`);
}
