import { useEffect, useRef } from 'react';
import { getGameState, setGameState, clearGameState } from '../lib/persistence';

// Read a previously-saved state for a game, if any.
export function loadSavedState<T>(gameId: string, deserialize: (d: unknown) => T | null): T | null {
  const data = getGameState(gameId);
  if (data == null) return null;
  try {
    return deserialize(data);
  } catch {
    return null;
  }
}

// Persist a game's state periodically, on page hide, and on unmount.
// When shouldSave(state) is false (e.g. the game is finished), the saved state is cleared.
export function useGameStatePersistence<T>(
  gameId: string,
  state: T,
  serialize: (s: T) => unknown,
  shouldSave: (s: T) => boolean
): void {
  const stateRef = useRef(state);
  stateRef.current = state;
  const serializeRef = useRef(serialize);
  serializeRef.current = serialize;
  const shouldSaveRef = useRef(shouldSave);
  shouldSaveRef.current = shouldSave;

  useEffect(() => {
    const save = () => {
      const s = stateRef.current;
      if (shouldSaveRef.current(s)) {
        try {
          setGameState(gameId, serializeRef.current(s));
        } catch {
          /* ignore */
        }
      } else {
        clearGameState(gameId);
      }
    };
    const interval = setInterval(save, 2000);
    window.addEventListener('pagehide', save);
    return () => {
      clearInterval(interval);
      window.removeEventListener('pagehide', save);
      save();
    };
  }, [gameId]);
}

export function clearSavedState(gameId: string): void {
  clearGameState(gameId);
}
