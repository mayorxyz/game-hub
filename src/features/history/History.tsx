import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Trash2 } from 'lucide-react';
import { getRecentlyPlayed, clearHistory } from '../../lib/persistence';
import { games } from '../../data/games';
import GameArtwork from '../../components/game/GameArtwork';

export default function History() {
  const recentlyPlayed = getRecentlyPlayed();

  const handleClear = () => {
    if (confirm('Clear all history?')) {
      clearHistory();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">History</h1>
            <p className="text-gray-400">Your recently played games</p>
          </div>
          {recentlyPlayed.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg text-sm text-gray-400 hover:text-white transition-all"
            >
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>

        {recentlyPlayed.length === 0 ? (
          <div className="text-center py-16">
            <Clock size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-2">No history yet</p>
            <p className="text-gray-500 text-sm mb-4">Start playing games to see them here</p>
            <Link to="/games" className="text-blue-400 hover:text-blue-300">
              Browse games
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {recentlyPlayed.map((gameId, i) => {
              const game = games.find(g => g.id === gameId);
              if (!game) return null;
              return (
                <Link
                  key={gameId}
                  to={`/play/${game.slug}`}
                  className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/[0.08] hover:border-white/20 rounded-lg p-4 transition-all"
                >
                  <GameArtwork gameId={game.id} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white mb-1">{game.name}</h3>
                    <p className="text-sm text-gray-400">{game.shortDescription}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
