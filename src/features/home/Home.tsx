import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Shuffle, Clock, Trophy, Heart, Gamepad2, ArrowRight, Sparkles } from 'lucide-react';
import { games, getFeaturedGames, getRandomGame } from '../../data/games';
import { getRecentlyPlayed, getHighScore, getFavorites } from '../../lib/persistence';
import GameArtwork from '../../components/game/GameArtwork';

export default function Home() {
  const navigate = useNavigate();
  const featuredGames = getFeaturedGames();
  const recentlyPlayed = getRecentlyPlayed();
  const favorites = getFavorites();
  const randomGame = getRandomGame();

  const handleRandomPlay = () => {
    const game = getRandomGame();
    navigate(`/play/${game.slug}`);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-blue-400" />
              <span className="text-sm font-medium text-blue-400">Welcome to Game Hub</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              What do you want
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                to play today?
              </span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl">
              {games.length} games. No downloads. No accounts. Just play.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRandomPlay}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all"
              >
                <Shuffle size={18} />
                Play Random
              </button>
              <Link
                to="/games"
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-lg transition-all"
              >
                <Gamepad2 size={18} />
                Browse Games
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Continue Playing */}
      {recentlyPlayed.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-gray-400" />
              <h2 className="font-display text-xl font-bold">Continue Playing</h2>
            </div>
            <Link to="/history" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentlyPlayed.slice(0, 3).map(gameId => {
              const game = games.find(g => g.id === gameId);
              if (!game) return null;
              return (
                <Link
                  key={game.id}
                  to={`/play/${game.slug}`}
                  className="group bg-white/5 hover:bg-white/10 border border-white/[0.08] hover:border-white/20 rounded-xl p-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <GameArtwork gameId={game.id} size="md" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1 truncate">{game.name}</h3>
                      <p className="text-sm text-gray-400">{game.shortDescription}</p>
                    </div>
                    <Play size={20} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Featured Games */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-yellow-400" />
            <h2 className="font-display text-xl font-bold">Featured Games</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredGames.slice(0, 6).map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <Link
                to={`/games/${game.slug}`}
                className="group block bg-white/5 hover:bg-white/10 border border-white/[0.08] hover:border-white/20 rounded-xl overflow-hidden transition-all"
              >
                <div className="aspect-video bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden">
                  <GameArtwork gameId={game.id} size="lg" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1">{game.name}</h3>
                  <p className="text-sm text-gray-400 mb-3">{game.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300 capitalize">
                        {game.category}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300 capitalize">
                        {game.difficulty}
                      </span>
                    </div>
                    <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Your Records */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-yellow-400" />
            <h2 className="font-display text-xl font-bold">Your Best Scores</h2>
          </div>
          <Link to="/leaderboard" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="bg-white/5 border border-white/[0.08] rounded-xl overflow-hidden">
          {games
            .map(g => ({ ...g, highScore: getHighScore(g.id) }))
            .filter(g => g.highScore > 0)
            .sort((a, b) => b.highScore - a.highScore)
            .slice(0, 5)
            .map((game, i) => (
              <Link
                key={game.id}
                to={`/games/${game.slug}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/[0.08] last:border-b-0"
              >
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm font-bold text-gray-400">
                  {i + 1}
                </div>
                <GameArtwork gameId={game.id} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{game.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{game.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-yellow-400 tabular-nums">{game.highScore.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          {games.filter(g => getHighScore(g.id) > 0).length === 0 && (
            <div className="px-4 py-12 text-center">
              <Trophy size={32} className="mx-auto mb-3 text-gray-600" />
              <p className="text-gray-400 mb-4">No scores yet</p>
              <Link to="/games" className="text-blue-400 hover:text-blue-300 text-sm">
                Start playing to set records
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Favorites */}
      {favorites.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Heart size={20} className="text-red-400" />
              <h2 className="font-display text-xl font-bold">Your Favorites</h2>
            </div>
            <Link to="/favorites" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.slice(0, 4).map(gameId => {
              const game = games.find(g => g.id === gameId);
              if (!game) return null;
              return (
                <Link
                  key={game.id}
                  to={`/games/${game.slug}`}
                  className="group bg-white/5 hover:bg-white/10 border border-white/[0.08] hover:border-white/20 rounded-xl p-4 transition-all"
                >
                  <GameArtwork gameId={game.id} size="md" />
                  <h3 className="font-medium text-white mt-3 mb-1">{game.name}</h3>
                  <p className="text-xs text-gray-400">{game.shortDescription}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
