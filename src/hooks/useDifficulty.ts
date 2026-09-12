import { useState, useEffect } from 'react';
import { Difficulty } from '../lib/difficulty';
import { getSettings, updateSettings, DATA_CHANGE_EVENT } from '../lib/persistence';

export function useDifficulty() {
  const [difficulty, setDifficultyState] = useState<Difficulty>(() => getSettings().difficulty);

  // Keep every consumer in sync (the selector may live in a different component).
  useEffect(() => {
    const sync = () => setDifficultyState(getSettings().difficulty);
    window.addEventListener(DATA_CHANGE_EVENT, sync);
    return () => window.removeEventListener(DATA_CHANGE_EVENT, sync);
  }, []);

  const setDifficulty = (newDifficulty: Difficulty) => {
    setDifficultyState(newDifficulty);
    updateSettings({ difficulty: newDifficulty });
  };

  return { difficulty, setDifficulty };
}
