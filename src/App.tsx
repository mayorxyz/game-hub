import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { games } from './data/routes';
import GameCard from './components/ui/GameCard';

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-gray-900 to-pink-900/20" />
        <div className="relative max-w-6xl mx-auto px-4 py-8 sm:py-12 text-center">
          <h1 className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            🎮 Game Hub
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">30 games — all in your browser. No downloads, no accounts.</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <div className="flex flex-wrap gap-2 justify-center text-xs sm:text-sm">
          <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            🎮 {games.filter(g => g.category === 'single').length} Single Player
          </span>
          <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
            🤖 {games.filter(g => g.category === 'bot').length} vs Bot
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            🏠 {games.filter(g => g.category === 'house').length} vs House
          </span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {games.map(game => (
            <GameCard
              key={game.id}
              id={game.id}
              name={game.name}
              category={game.category}
              path={game.path}
              icon={game.icon}
            />
          ))}
        </div>
      </main>

      <footer className="text-center text-gray-600 text-xs py-6 border-t border-gray-800">
        Built with React + TypeScript + Tailwind CSS
      </footer>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading game...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          {games.map(game => (
            <Route
              key={game.id}
              path={game.path}
              element={<game.component />}
            />
          ))}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
