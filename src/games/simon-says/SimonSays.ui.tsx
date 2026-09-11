import React, { useState, useEffect, useRef, useCallback } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import {
  GameState,
  COLORS,
  SEQUENCE_DELAY,
  ACTIVE_DURATION,
  NEXT_SEQUENCE_DELAY,
  PLAYER_ACTIVE_DURATION,
  createInitialState,
  generateNextSequence,
  checkPlayerInput,
} from './SimonSays';
import { handleColorPress } from './SimonSays.controls';

const COLOR_STYLES: Record<string, string> = {
  red: 'bg-red-800',
  blue: 'bg-blue-800',
  green: 'bg-green-800',
  yellow: 'bg-yellow-800',
};

const ACTIVE_STYLES: Record<string, string> = {
  red: 'bg-red-400 shadow-lg shadow-red-400/50',
  blue: 'bg-blue-400 shadow-lg shadow-blue-400/50',
  green: 'bg-green-400 shadow-lg shadow-green-400/50',
  yellow: 'bg-yellow-400 shadow-lg shadow-yellow-400/50',
};

export default function SimonSays() {
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [highScore, setHighScoreState] = useState(getHighScore('simon-says'));
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current = [];
  }, []);

  // Show sequence
  const showSequence = useCallback((seq: string[]) => {
    clearAllTimeouts();
    setGameState(prev => ({ ...prev, isShowing: true }));

    seq.forEach((color, i) => {
      const showTimeout = setTimeout(() => {
        setGameState(prev => ({ ...prev, activeColor: color }));
      }, i * SEQUENCE_DELAY);
      
      const hideTimeout = setTimeout(() => {
        setGameState(prev => ({ ...prev, activeColor: null }));
      }, i * SEQUENCE_DELAY + ACTIVE_DURATION);

      timeoutsRef.current.push(showTimeout, hideTimeout);
    });

    const endTimeout = setTimeout(() => {
      setGameState(prev => ({ ...prev, isShowing: false, playerIdx: 0 }));
    }, seq.length * SEQUENCE_DELAY);

    timeoutsRef.current.push(endTimeout);
  }, [clearAllTimeouts]);

  // Start game
  const start = useCallback(() => {
    clearAllTimeouts();
    const firstSequence = [COLORS[Math.floor(Math.random() * COLORS.length)]];
    setGameState({
      sequence: firstSequence,
      playerIdx: 0,
      activeColor: null,
      isShowing: false,
      isGameOver: false,
      score: 0,
      isStarted: true,
    });
    
    const startTimeout = setTimeout(() => showSequence(firstSequence), 100);
    timeoutsRef.current.push(startTimeout);
  }, [clearAllTimeouts, showSequence]);

  // Handle color press
  const onActivate = useCallback((color: string) => {
    setGameState(prev => ({ ...prev, activeColor: color }));
    
    const deactivateTimeout = setTimeout(() => {
      setGameState(prev => ({ ...prev, activeColor: null }));
    }, PLAYER_ACTIVE_DURATION);
    timeoutsRef.current.push(deactivateTimeout);

    const { correct, roundComplete } = checkPlayerInput(
      gameState.sequence,
      gameState.playerIdx,
      color
    );

    if (correct) {
      if (roundComplete) {
        const newScore = gameState.score + 1;
        setHighScoreState(prev => {
          const best = Math.max(prev, newScore);
          setHighScore('simon-says', best);
          return best;
        });
        
        const nextSequence = generateNextSequence(gameState.sequence);
        setGameState(prev => ({ ...prev, score: newScore, sequence: nextSequence }));
        
        const nextTimeout = setTimeout(() => showSequence(nextSequence), NEXT_SEQUENCE_DELAY);
        timeoutsRef.current.push(nextTimeout);
      } else {
        setGameState(prev => ({ ...prev, playerIdx: prev.playerIdx + 1 }));
      }
    } else {
      setGameState(prev => ({ ...prev, isGameOver: true }));
    }
  }, [gameState.sequence, gameState.playerIdx, gameState.score, showSequence]);

  const onColorPress = useCallback((color: string) => {
    handleColorPress(
      gameState.isShowing,
      gameState.isGameOver,
      gameState.isStarted,
      onActivate,
      color
    );
  }, [gameState.isShowing, gameState.isGameOver, gameState.isStarted, onActivate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  return (
    <GameLayout
      title="Simon Says"
      score={gameState.score}
      highScore={highScore}
      onReset={start}
    >
      <div className="flex flex-col items-center gap-4">
        {gameState.isGameOver && (
          <p className="text-red-400 text-xl font-bold">Wrong! Score: {gameState.score}</p>
        )}
        {!gameState.isStarted && (
          <button
            onClick={start}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-lg font-bold"
          >
            Start
          </button>
        )}
        <div className="grid grid-cols-2 gap-3 w-56 h-56 sm:w-64 sm:h-64">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => onColorPress(color)}
              disabled={gameState.isShowing}
              className={`min-w-[48px] min-h-[48px] rounded-2xl transition-all duration-150 ${
                gameState.activeColor === color ? ACTIVE_STYLES[color] : COLOR_STYLES[color]
              } ${gameState.isShowing ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80 active:opacity-60'}`}
              style={{ touchAction: 'manipulation' }}
            />
          ))}
        </div>
        <p className="text-gray-500 text-xs">
          {gameState.isShowing ? 'Watch...' : gameState.isStarted && !gameState.isGameOver ? 'Your turn!' : ''}
        </p>
      </div>
    </GameLayout>
  );
}
