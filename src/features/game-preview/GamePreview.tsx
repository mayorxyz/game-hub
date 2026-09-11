import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Heart, Clock, Trophy, ChevronLeft, Info, Star } from 'lucide-react';
import { getGameBySlug } from '../../data/games';
import { getHighScore, isFavorite, addFavorite, removeFavorite } from '../../lib/persistence';
import GameArtwork from '../../components/game/GameArtwork';
import { useState } from 'react';

export default function GamePreview() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const game = getGameBySlug(slug || '');
  const [favorited, setFavorited] = useState(game ? isFavorite(game.id) : false);

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

  const handlePlay = () => {
    navigate(`/play/${game.slug}`);
  };

  const handleToggleFavorite = () => {
    if (favorited) {
      removeFavorite(game.id);
      setFavorited(false);
    } else {
      addFavorite(game.id);
      setFavorited(true);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Back Link */}
        <Link
          to="/games"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Back to Games
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Game Header */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            {/* Artwork */}
            <div className="lg:w-1/2">
              <div className="aspect-video bg-gradient-to-br from-white/5 to-transparent rounded-xl overflow-hidden border border-white/[0.08]">
                <GameArtwork gameId={game.id} size="lg" />
              </div>
            </div>

            {/* Info */}
            <div className="lg:w-1/2">
              <h1 className="font-display text-3xl sm:text-4xl font-bold mb-3">{game.name}</h1>
              <p className="text-gray-400 mb-6">{game.description}</p>

              {/* Metadata */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-gray-300 capitalize">
                  {game.category}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-gray-300 capitalize">
                  {game.difficulty}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-gray-300 capitalize">
                  {game.mode === 'bot' ? 'vs Bot' : game.mode === 'house' ? 'vs House' : 'Single Player'}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-white/10 text-sm text-gray-300 flex items-center gap-1">
                  <Clock size={12} />
                  {game.estimatedPlayTime}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handlePlay}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-all"
                >
                  <Play size={18} />
                  Play Now
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className={`flex items-center gap-2 px-4 py-3 border rounded-lg transition-all ${
                    favorited
                      ? 'bg-red-500/10 border-red-500/30 text-red-400'
                      : 'bg-white/5 border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Heart size={18} fill={favorited ? 'currentColor' : 'none'} />
                  {favorited ? 'Favorited' : 'Favorite'}
                </button>
              </div>
            </div>
          </div>

          {/* High Score */}
          {highScore > 0 && (
            <div className="bg-white/5 border border-white/[0.08] rounded-xl p-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <Trophy size={20} className="text-yellow-400" />
                <h2 className="font-display text-lg font-bold">Your Best Score</h2>
              </div>
              <p className="text-3xl font-bold text-yellow-400 tabular-nums">{highScore.toLocaleString()}</p>
            </div>
          )}

          {/* How to Play */}
          <div className="bg-white/5 border border-white/[0.08] rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Info size={20} className="text-blue-400" />
              <h2 className="font-display text-lg font-bold">How to Play</h2>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Objective</h3>
              <p className="text-gray-400">{game.instructions.objective}</p>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">How to Play</h3>
              <ol className="space-y-1">
                {game.instructions.howToPlay.map((step, i) => (
                  <li key={i} className="text-gray-400 flex gap-2">
                    <span className="text-blue-400 font-medium">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {game.instructions.scoring && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Scoring</h3>
                <p className="text-gray-400">{game.instructions.scoring}</p>
              </div>
            )}

            {game.instructions.tips && game.instructions.tips.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Tips</h3>
                <ul className="space-y-1">
                  {game.instructions.tips.map((tip, i) => (
                    <li key={i} className="text-gray-400 flex gap-2">
                      <Star size={12} className="text-yellow-400 mt-1 flex-shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="bg-white/5 border border-white/[0.08] rounded-xl p-6">
            <h2 className="font-display text-lg font-bold mb-4">Controls</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {game.controls.keyboard && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Keyboard</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.controls.keyboard.map((control, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-sm text-gray-300">
                        {control}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {game.controls.touch && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Touch</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.controls.touch.map((control, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-sm text-gray-300">
                        {control}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {game.controls.mouse && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-300 mb-2">Mouse</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.controls.mouse.map((control, i) => (
                      <span key={i} className="px-3 py-1.5 bg-white/10 rounded-lg text-sm text-gray-300">
                        {control}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
