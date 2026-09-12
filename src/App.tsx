import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/app/AppShell';
import Home from './features/home/Home';
import Library from './features/library/Library';
import GamePreview from './features/game-preview/GamePreview';
import GameSession from './features/game-session/GameSession';
import History from './features/history/History';
import Favorites from './features/favorites/Favorites';
import Leaderboard from './features/leaderboard/Leaderboard';
import Settings from './features/settings/Settings';
import Daily from './features/daily/Daily';

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<AppShell><Home /></AppShell>} />
          <Route path="/games" element={<AppShell><Library /></AppShell>} />
          <Route path="/games/:slug" element={<AppShell><GamePreview /></AppShell>} />
          <Route path="/play/:slug" element={<GameSession />} />
          <Route path="/history" element={<AppShell><History /></AppShell>} />
          <Route path="/favorites" element={<AppShell><Favorites /></AppShell>} />
          <Route path="/leaderboard" element={<AppShell><Leaderboard /></AppShell>} />
          <Route path="/settings" element={<AppShell><Settings /></AppShell>} />
          <Route path="/daily" element={<AppShell><Daily /></AppShell>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
