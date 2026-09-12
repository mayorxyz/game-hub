import React from 'react';

interface PassDeviceOverlayProps {
  player: number;
  onReady: () => void;
}

// Shown between turns in local (hotseat) two-player mode so the next player
// can take the device without seeing the previous player's move first.
export default function PassDeviceOverlay({ player, onReady }: PassDeviceOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-gray-900/95 rounded-xl p-6 text-center">
      <div className="text-lg font-bold text-white">Pass the device</div>
      <div className="text-gray-400">Player {player}&apos;s turn</div>
      <button
        onClick={onReady}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-400 text-white font-bold rounded-xl transition-colors"
      >
        I&apos;m ready
      </button>
    </div>
  );
}
