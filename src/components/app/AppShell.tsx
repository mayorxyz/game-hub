import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Trophy, Clock, Heart, Settings, Menu, X, Calendar } from 'lucide-react';
import { useState } from 'react';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/games', label: 'Games', icon: Gamepad2 },
    { path: '/daily', label: 'Daily', icon: Calendar },
    { path: '/leaderboard', label: 'Records', icon: Trophy },
    { path: '/achievements', label: 'Achievements', icon: Trophy },
    { path: '/history', label: 'History', icon: Clock },
    { path: '/favorites', label: 'Favorites', icon: Heart },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f5f5]">
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Gamepad2 size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg">Game Hub</span>
            </Link>

            <div className="flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.08]">
        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Gamepad2 size={14} className="text-white" />
              </div>
              <span className="font-display font-bold text-base">Game Hub</span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/5"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-white/[0.08] bg-[#0a0a0a]">
            <div className="px-4 py-3 space-y-1">
              {navItems.map(item => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive(item.path)
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="pt-16 md:pt-16">
        {children}
      </main>
    </div>
  );
}
