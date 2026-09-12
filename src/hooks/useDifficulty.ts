import { useState, useEffect } from 'react';
import { Difficulty } from '../lib/difficulty';
import { getSettings, updateSettings } from '../lib/persistence';

export function useDifficulty() {
  const [difficulty, setDifficultyState] = useState<Difficulty>(() => {
    const settings = getSettings();
    return settings.difficulty;
  });

  const setDifficulty = (newDifficulty: Difficulty) => {
    setDifficultyState(newDifficulty);
    updateSettings({ difficulty: newDifficulty });
  };

  return { difficulty, setDifficulty };
}
