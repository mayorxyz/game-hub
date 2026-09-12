import { useState, useEffect, useCallback } from 'react';
import { getGameStats, recordGameResult as persistRecordResult, DATA_CHANGE_EVENT, type GameStats } from '../lib/persistence';

export function useStats() {
  const [stats, setStats] = useState<GameStats>(getGameStats);

  // Re-read stats when localStorage changes (e.g., after recording a result)
  useEffect(() => {
    const handleChange = () => {
      setStats(getGameStats());
    };
    window.addEventListener('storage', handleChange);
    window.addEventListener(DATA_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(DATA_CHANGE_EVENT, handleChange);
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
