import { useState, useEffect, useCallback } from 'react';
import { getUnlockedAchievements, unlockAchievement as persistUnlock, DATA_CHANGE_EVENT } from '../lib/persistence';

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<string[]>(getUnlockedAchievements);

  // Re-read achievements when localStorage changes
  useEffect(() => {
    const handleChange = () => {
      setUnlocked(getUnlockedAchievements());
    };
    window.addEventListener('storage', handleChange);
    window.addEventListener(DATA_CHANGE_EVENT, handleChange);
    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener(DATA_CHANGE_EVENT, handleChange);
    };
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    persistUnlock(id);
    setUnlocked(getUnlockedAchievements());
  }, []);

  return { unlocked, unlockAchievement };
}
