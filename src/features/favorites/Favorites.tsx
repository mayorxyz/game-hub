import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2 } from 'lucide-react';
import { getFavorites, clearFavorites } from '../../lib/persistence';
import { games } from '../../data/games';
import GameArtwork from '../../components/game/GameArtwork';

export default function Favorites() {
  const favorites = getFavorites();

  const handleClear = () => {
    if (confirm('Remove all favorites?')) {
      clearFavorites();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-2">Favorites</h1>
            <p className="text-gray-400">Your favorite games</p>
          </div>
          {favorites.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg text-sm text-gray-400 hover:text-white transition-all"
            >
              <Trash2 size={14} />
              Clear
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-2">No favorites yet</p>
            <p className="text-gray-500 text-sm mb-4">Add games to your favorites to see them here</p>
            <Link to="/games" className="text-blue-400 hover:text-blue-300">
              Browse games
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map(gameId => {
              const game = games.find(g => g.id === gameId);
              if (!game) return null;
              return (
                <Link
                  key={gameId}
                  to={`/games/${game.slug}`}
                  className="group bg-white/5 hover:bg-white/10 border border-white/[0.08] hover:border-white/20 rounded-xl overflow-hidden transition-all"
                >
                  <div className="aspect-video bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                    <GameArtwork gameId={game.id} size="lg" />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1">{game.name}</h3>
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
