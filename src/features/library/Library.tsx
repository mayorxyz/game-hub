import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Grid, List, ArrowRight } from 'lucide-react';
import { games } from '../../data/games';
import { getHighScore } from '../../lib/persistence';
import GameArtwork from '../../components/game/GameArtwork';

type ViewMode = 'grid' | 'list';
type SortOption = 'recommended' | 'alphabetical' | 'difficulty' | 'high-score';

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('recommended');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [modeFilter, setModeFilter] = useState<string>('all');

  const categories = ['all', 'arcade', 'puzzle', 'word', 'strategy', 'classic'];
  const modes = ['all', 'single', 'bot', 'house'];

  const filteredGames = useMemo(() => {
    let result = [...games];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.tags.some(t => t.includes(q))
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(g => g.category === categoryFilter);
    }

    // Mode filter
    if (modeFilter !== 'all') {
      result = result.filter(g => g.mode === modeFilter);
    }

    // Sort
    switch (sortBy) {
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'difficulty':
        const diffOrder = { easy: 1, medium: 2, hard: 3 };
        result.sort((a, b) => diffOrder[a.difficulty] - diffOrder[b.difficulty]);
        break;
      case 'high-score':
        result.sort((a, b) => getHighScore(b.id) - getHighScore(a.id));
        break;
    }

    return result;
  }, [searchQuery, categoryFilter, modeFilter, sortBy]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Game Library</h1>
          <p className="text-gray-400">Discover and play all {games.length} games</p>
        </div>

        {/* Search & Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/[0.08] rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filters & Sort */}
          <div className="flex flex-wrap gap-3 items-center">
            {/* Category Filter */}
            <div className="flex gap-1 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    categoryFilter === cat
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            {/* Mode Filter */}
            <div className="flex gap-1 flex-wrap">
              {modes.map(mode => (
                <button
                  key={mode}
                  onClick={() => setModeFilter(mode)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    modeFilter === mode
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {mode === 'all' ? 'All' : mode === 'bot' ? 'vs Bot' : mode === 'house' ? 'vs House' : 'Single'}
                </button>
              ))}
            </div>

            {/* View Toggle */}
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white/5 border border-white/[0.08] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="recommended">Recommended</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="difficulty">Difficulty</option>
              <option value="high-score">Highest Score</option>
            </select>
          </div>
        </div>

        {/* Results */}
        {filteredGames.length === 0 ? (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 text-lg mb-2">No games found</p>
            <p className="text-gray-500 text-sm">Try a different search or filter</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
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
        ) : (
          <div className="space-y-2">
            {filteredGames.map((game, i) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <Link
                  to={`/games/${game.slug}`}
                  className="flex items-center gap-4 bg-white/5 hover:bg-white/10 border border-white/[0.08] hover:border-white/20 rounded-lg p-4 transition-all"
                >
                  <GameArtwork gameId={game.id} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white mb-1">{game.name}</h3>
                    <p className="text-sm text-gray-400">{game.shortDescription}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-gray-300 capitalize">
                      {game.category}
                    </span>
                    <ArrowRight size={16} className="text-gray-400" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
