import { useState, useEffect, useCallback } from 'react';
import { getGameStats, recordGameResult as persistRecordResult, type GameStats } from '../lib/persistence';

export function useStats() {
  const [stats, setStats] = useState<GameStats>(getGameStats);

  // Re-read stats when localStorage changes (e.g., after recording a result)
  useEffect(() => {
    const handleStorage = () => {
      setStats(getGameStats());
    };
    window.addEventListener('storage', handleStorage);
    // Also poll periodically for same-tab updates
    const interval = setInterval(handleStorage, 500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const recordGameResult = useCallback(
    (gameId: string, result: { won: boolean; score: number; durationMs?: number }) => {
      persistRecordResult(gameId, result);
      setStats(getGameStats());
    },
    []
  );

  return { stats, recordGameResult };
}
