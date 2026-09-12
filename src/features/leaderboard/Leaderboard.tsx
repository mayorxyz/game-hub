import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { getHighScore } from '../../lib/persistence';
import { useStats } from '../../hooks/useStats';
import { games } from '../../data/games';
import GameArtwork from '../../components/game/GameArtwork';

export default function Leaderboard() {
  const { stats } = useStats();
  const winRate = stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0;
  const gamesWithScores = games
    .map(g => ({ ...g, highScore: getHighScore(g.id) }))
    .filter(g => g.highScore > 0)
    .sort((a, b) => b.highScore - a.highScore);

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Your Records</h1>
          <p className="text-gray-400">Your best scores across all games</p>
        </div>

        {/* Lifetime stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white tabular-nums">{stats.gamesPlayed}</div>
            <div className="text-xs text-gray-400 mt-1">Games played</div>
          </div>
          <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400 tabular-nums">{stats.gamesWon}</div>
            <div className="text-xs text-gray-400 mt-1">Games won</div>
          </div>
          <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-amber-400 tabular-nums">{stats.bestStreak ?? 0}</div>
            <div className="text-xs text-gray-400 mt-1">Best win streak</div>
          </div>
          <div className="bg-white/5 border border-white/[0.08] rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 tabular-nums">{winRate}%</div>
            <div className="text-xs text-gray-400 mt-1">Win rate</div>
          </div>
        </div>

        {gamesWithScores.length === 0 ? (
          <div className="text-center py-16">
            <Trophy size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-2">No scores yet</p>
            <p className="text-gray-500 text-sm mb-4">Start playing to set records</p>
            <Link to="/games" className="text-blue-400 hover:text-blue-300">
              Browse games
            </Link>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/[0.08] rounded-xl overflow-hidden">
            {gamesWithScores.map((game, i) => (
              <Link
                key={game.id}
                to={`/games/${game.slug}`}
                className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors border-b border-white/[0.08] last:border-b-0"
              >
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-sm font-bold text-gray-400">
                  {i + 1}
                </div>
                <GameArtwork gameId={game.id} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white mb-1">{game.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{game.category} · {game.difficulty}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-yellow-400 tabular-nums">{game.highScore.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
