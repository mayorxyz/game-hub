import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface PauseContextValue {
  paused: boolean;
  toggle: () => void;
  setPaused: (paused: boolean) => void;
}

const PauseContext = createContext<PauseContextValue | null>(null);

// Provides a single pause state for a game session. GameLayout renders the
// button/overlay; games read `paused` to stop their own loops/timers.
export function PauseProvider({ children }: { children: React.ReactNode }) {
  const [paused, setPausedState] = useState(false);
  const toggle = useCallback(() => setPausedState(p => !p), []);
  const setPaused = useCallback((v: boolean) => setPausedState(v), []);
  const value = useMemo(() => ({ paused, toggle, setPaused }), [paused, toggle, setPaused]);
  return <PauseContext.Provider value={value}>{children}</PauseContext.Provider>;
}

const NOOP: PauseContextValue = { paused: false, toggle: () => {}, setPaused: () => {} };

export function usePause(): PauseContextValue {
  return useContext(PauseContext) ?? NOOP;
}
