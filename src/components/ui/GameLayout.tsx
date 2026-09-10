import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';

interface GameLayoutProps {
  title: string;
  score?: number | string;
  highScore?: number | string;
  onReset?: () => void;
  children: React.ReactNode;
}

export default function GameLayout({ title, score, highScore, onReset, children }: GameLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <header className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            {onReset && (
              <button
                onClick={onReset}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                title="Reset"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      {(score !== undefined || highScore !== undefined) && (
        <div className="bg-gray-800/50 border-b border-gray-800 px-4 py-2">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-4 sm:gap-6 text-sm">
            {score !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Score:</span>
                <span className="font-bold text-white">{score}</span>
              </div>
            )}
            {highScore !== undefined && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Best:</span>
                <span className="font-bold text-amber-400">{highScore}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="w-full max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  );
}
