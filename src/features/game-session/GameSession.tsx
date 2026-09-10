import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Trophy, Heart } from 'lucide-react';
import { getGameBySlug } from '../../data/games';
import { getHighScore, addRecentlyPlayed, isFavorite } from '../../lib/persistence';

export default function GameSession() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const game = getGameBySlug(slug || '');

  useEffect(() => {
    if (game) {
      addRecentlyPlayed(game.id);
    }
  }, [game]);

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Game not found</h2>
          <p className="text-gray-400 mb-4">The game you're looking for doesn't exist.</p>
          <Link to="/games" className="text-blue-400 hover:text-blue-300">
            Browse all games
          </Link>
        </div>
      </div>
    );
  }

  const highScore = getHighScore(game.id);
  const GameComponent = game.component;

  return (
    <div className="min-h-screen">
      {/* Game Header */}
      <div className="sticky top-14 md:top-16 z-40 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <Link
              to={`/games/${game.slug}`}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">{game.name}</span>
            </Link>

            <div className="flex items-center gap-4">
              {highScore > 0 && (
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400 tabular-nums">
                    {highScore.toLocaleString()}
                  </span>
                </div>
              )}
              {isFavorite(game.id) && (
                <Heart size={14} className="text-red-400" fill="currentColor" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GameComponent />
        </motion.div>
      </div>
    </div>
  );
}
