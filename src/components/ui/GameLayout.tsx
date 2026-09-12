import React, { useEffect } from 'react';
import { RotateCcw, Pause, Play } from 'lucide-react';
import { useDifficulty } from '../../hooks/useDifficulty';
import { usePause } from '../../lib/pause';
import DifficultySelector from './DifficultySelector';

interface GameLayoutProps {
  title: string;
  score?: number | string;
  highScore?: number | string;
  onReset?: () => void;
  showDifficulty?: boolean;
  /** Set false for games that use Space as a gameplay key (Space then only pauses via P / the button). */
  pauseOnSpace?: boolean;
  children: React.ReactNode;
}

export default function GameLayout({
  title,
  score,
  highScore,
  onReset,
  showDifficulty = false,
  pauseOnSpace = true,
  children,
}: GameLayoutProps) {
  const { difficulty, setDifficulty } = useDifficulty();
  const { paused, toggle } = usePause();

  // Global pause shortcut: P always; Space too unless the game claims Space.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        toggle();
      } else if (pauseOnSpace && (e.key === ' ' || e.code === 'Space')) {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pauseOnSpace, toggle]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 sm:p-5">
      {/* Compact HUD Bar */}
      <div className="w-full flex items-center justify-between gap-4 mb-3 sm:mb-5">
        {/* Left: Title */}
        <h1 className="text-lg sm:text-xl font-bold text-white truncate">
          {title}
        </h1>

        {/* Center: Score Metrics */}
        <div className="flex items-center gap-4 sm:gap-6 text-sm">
          {score !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Score:</span>
              <span className="font-bold text-white tabular-nums">{score}</span>
            </div>
          )}
          {highScore !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Best:</span>
              <span className="font-bold text-amber-400 tabular-nums">{highScore}</span>
            </div>
          )}
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label={paused ? 'Resume game' : 'Pause game'}
            aria-pressed={paused}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            title={paused ? 'Resume (Space)' : 'Pause (Space)'}
          >
            {paused ? <Play size={16} /> : <Pause size={16} />}
          </button>
          {onReset && (
            <button
              onClick={onReset}
              aria-label="Restart game"
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Reset"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {showDifficulty && (
        <div className="w-full flex justify-center mb-2 sm:mb-3">
          <DifficultySelector value={difficulty} onChange={setDifficulty} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center">
        {children}

        {/* Pause overlay */}
        {paused && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-gray-950/85 backdrop-blur-sm rounded-xl">
            <div className="text-3xl font-bold text-white">Paused</div>
            <button
              onClick={toggle}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-400 text-white font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              <Play size={18} />
              Resume
            </button>
            <p className="text-xs text-gray-400">Press Space or P to resume</p>
          </div>
        )}
      </div>
    </div>
  );
}
