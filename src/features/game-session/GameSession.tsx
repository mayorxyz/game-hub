import React, { useEffect, Suspense } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Trophy, Heart } from 'lucide-react';
import { getGameBySlug } from '../../data/games';
import { getHighScore, addRecentlyPlayed, isFavorite } from '../../lib/persistence';
import { getDailySeed } from '../../lib/daily';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-gray-400">Please refresh the page</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function GameSession() {
  const { slug } = useParams<{ slug: string }>();
  const game = getGameBySlug(slug || '');
  const [searchParams] = useSearchParams();
  const isDaily = searchParams.get('daily') === '1';
  const dailySeed = isDaily ? getDailySeed(game?.id ?? '') : undefined;

  useEffect(() => {
    if (game) {
      addRecentlyPlayed(game.id);
    }
  }, [game]);

  if (!game) {
    return (
      <div className="h-[100dvh] flex items-center justify-center">
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
  const GameComponent = game.component as React.LazyExoticComponent<React.ComponentType<any>>;

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden bg-[#0a0a0a]">
      {/* Compact Header */}
      <div className="h-14 flex-shrink-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="h-full px-4 flex items-center justify-between">
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

      {/* Full-Bleed Game Content */}
      <div className="flex-1 min-h-0 w-full">
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-400">Loading...</div>
            </div>
          }>
            <GameComponent daily={isDaily} dailySeed={dailySeed} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}
