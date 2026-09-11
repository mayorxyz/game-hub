import React from 'react';
import { getGameById } from '../../data/games';

interface GameArtworkProps {
  gameId: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-full h-full',
};

// Each game gets a unique CSS-based visual identity
const GameVisuals: Record<string, React.FC<{ className: string }>> = {
  snake: ({ className }) => (
    <div className={`${className} bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-[1px] opacity-20">
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="bg-green-500/30 rounded-[1px]" />
        ))}
      </div>
      <div className="relative flex gap-[2px]">
        <div className="w-2 h-2 bg-green-400 rounded-sm" />
        <div className="w-2 h-2 bg-green-500 rounded-sm" />
        <div className="w-2 h-2 bg-green-600 rounded-sm" />
      </div>
    </div>
  ),
  '2048': ({ className }) => (
    <div className={`${className} bg-gradient-to-br from-amber-500/20 to-orange-600/10 flex items-center justify-center`}>
      <div className="grid grid-cols-2 gap-1">
        <div className="w-3 h-3 bg-amber-400/60 rounded-sm flex items-center justify-center text-[6px] font-bold text-white">2</div>
        <div className="w-3 h-3 bg-orange-500/60 rounded-sm flex items-center justify-center text-[6px] font-bold text-white">4</div>
        <div className="w-3 h-3 bg-orange-600/60 rounded-sm flex items-center justify-center text-[6px] font-bold text-white">8</div>
        <div className="w-3 h-3 bg-red-500/60 rounded-sm flex items-center justify-center text-[6px] font-bold text-white">16</div>
      </div>
    </div>
  ),
  'memory-match': ({ className }) => (
    <div className={`${className} bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center`}>
      <div className="grid grid-cols-2 gap-1">
        <div className="w-3 h-3 bg-purple-400/40 rounded-sm" />
        <div className="w-3 h-3 bg-purple-500/60 rounded-sm" />
        <div className="w-3 h-3 bg-purple-500/60 rounded-sm" />
        <div className="w-3 h-3 bg-purple-400/40 rounded-sm" />
      </div>
    </div>
  ),
  minesweeper: ({ className }) => (
    <div className={`${className} bg-gradient-to-br from-zinc-500/20 to-zinc-600/10 flex items-center justify-center`}>
      <div className="grid grid-cols-3 gap-[1px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-[1px] ${i === 4 ? 'bg-red-500/60' : 'bg-zinc-400/30'}`} />
        ))}
      </div>
    </div>
  ),
  sudoku: ({ className }) => (
    <div className={`${className} bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center`}>
      <div className="grid grid-cols-3 gap-[1px]">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="w-2 h-2 bg-blue-400/40 rounded-[1px] flex items-center justify-center text-[5px] text-blue-300 font-bold">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  ),
  // Add more game visuals as needed
  default: ({ className }) => (
    <div className={`${className} bg-gradient-to-br from-gray-500/20 to-gray-600/10 flex items-center justify-center`}>
      <div className="w-4 h-4 bg-gray-400/40 rounded" />
    </div>
  ),
};

export default function GameArtwork({ gameId, size = 'md' }: GameArtworkProps) {
  const game = getGameById(gameId);
  const Visual = GameVisuals[gameId] || GameVisuals.default;
  const sizeClass = sizeMap[size];

  return <Visual className={sizeClass} />;
}
