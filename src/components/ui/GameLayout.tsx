import React from 'react';
import { RotateCcw, Pause } from 'lucide-react';

interface GameLayoutProps {
  title: string;
  score?: number | string;
  highScore?: number | string;
  onReset?: () => void;
  onPause?: () => void;
  children: React.ReactNode;
}

export default function GameLayout({ title, score, highScore, onReset, onPause, children }: GameLayoutProps) {
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
          {onPause && (
            <button
              onClick={onPause}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Pause"
            >
              <Pause size={16} />
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Reset"
            >
              <RotateCcw size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 w-full flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
