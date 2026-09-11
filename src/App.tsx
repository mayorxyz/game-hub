import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AppShell from './components/app/AppShell';
import Home from './features/home/Home';
import Library from './features/library/Library';
import GamePreview from './features/game-preview/GamePreview';
import GameSession from './features/game-session/GameSession';
import History from './features/history/History';
import Favorites from './features/favorites/Favorites';
import Leaderboard from './features/leaderboard/Leaderboard';
import Settings from './features/settings/Settings';
import { useSettings } from './hooks/useSettings';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

// Error Boundary to catch unexpected errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game Hub Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
            <p className="text-gray-400 mb-6">
              An unexpected error occurred. You can try refreshing the page or going back home.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Refresh Page
              </button>
              <Link
                to="/"
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// 404 Not Found page
function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-700 mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
        <p className="text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

function AppContent() {
  // Apply theme globally
  useSettings();

  return (
    <Routes>
      {/* Main pages with AppShell */}
      <Route path="/" element={<AppShell><Home /></AppShell>} />
      <Route path="/games" element={<AppShell><Library /></AppShell>} />
      <Route path="/history" element={<AppShell><History /></AppShell>} />
      <Route path="/favorites" element={<AppShell><Favorites /></AppShell>} />
      <Route path="/leaderboard" element={<AppShell><Leaderboard /></AppShell>} />
      <Route path="/settings" element={<AppShell><Settings /></AppShell>} />
      
      {/* Game preview */}
      <Route path="/games/:slug" element={<AppShell><GamePreview /></AppShell>} />
      
      {/* Game session (play) - no AppShell for focused gameplay */}
      <Route path="/play/:slug" element={<GameSession />} />
      
      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <AppContent />
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
