import { useState, useEffect, useCallback } from 'react';
import { getUnlockedAchievements, unlockAchievement as persistUnlock } from '../lib/persistence';

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<string[]>(getUnlockedAchievements);

  // Re-read achievements when localStorage changes
  useEffect(() => {
    const handleStorage = () => {
      setUnlocked(getUnlockedAchievements());
    };
    window.addEventListener('storage', handleStorage);
    const interval = setInterval(handleStorage, 500);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    persistUnlock(id);
    setUnlocked(getUnlockedAchievements());
  }, []);

  return { unlocked, unlockAchievement };
}
