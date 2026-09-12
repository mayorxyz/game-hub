import React from 'react';
import { useSettings } from '../../hooks/useSettings';
import { clearHistory, clearFavorites, clearAllHighScores, resetAll } from '../../lib/persistence';
import { setSoundEnabled } from '../../lib/sound';
import { Sun, Moon, Monitor, Trash2, RotateCcw } from 'lucide-react';

export default function Settings() {
  const { settings, updateSettings } = useSettings();

  const handleResetAll = () => {
    if (confirm('Reset all data? This will clear all scores, history, favorites, and settings.')) {
      resetAll();
      window.location.reload();
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear all history?')) {
      clearHistory();
      window.location.reload();
    }
  };

  const handleClearFavorites = () => {
    if (confirm('Clear all favorites?')) {
      clearFavorites();
      window.location.reload();
    }
  };

  const handleClearScores = () => {
    if (confirm('Clear all high scores?')) {
      clearAllHighScores();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">Settings</h1>
          <p className="text-gray-400">Customize your Game Hub experience</p>
        </div>

        {/* Appearance */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold mb-4">Appearance</h2>
          <div className="bg-white/5 border border-white/[0.08] rounded-xl p-6">
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 mb-3 block">Theme</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => updateSettings({ theme: 'system' })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    settings.theme === 'system'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/[0.08] text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Monitor size={16} />
                  <span className="text-sm">System</span>
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/[0.08] text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Moon size={16} />
                  <span className="text-sm">Dark</span>
                </button>
                <button
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                    settings.theme === 'light'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : 'bg-white/5 border-white/[0.08] text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Sun size={16} />
                  <span className="text-sm">Light</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Gameplay */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold mb-4">Gameplay</h2>
          <div className="bg-white/5 border border-white/[0.08] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Auto-show instructions</p>
                <p className="text-sm text-gray-400">Display instructions when opening a game</p>
              </div>
              <button
                onClick={() => updateSettings({ showInstructions: !settings.showInstructions })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.showInstructions ? 'bg-blue-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.showInstructions ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Confirm restart</p>
                <p className="text-sm text-gray-400">Ask before restarting a game</p>
              </div>
              <button
                onClick={() => updateSettings({ confirmRestart: !settings.confirmRestart })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.confirmRestart ? 'bg-blue-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.confirmRestart ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

                        <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Sound effects</p>
                <p className="text-sm text-gray-400">Play sounds during games</p>
              </div>
              <button
                onClick={() => setSoundEnabled(!settings.soundEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.soundEnabled ? 'bg-blue-500' : 'bg-white/10'}`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                />
              </button>
            </div>

<div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Reduced motion</p>
                <p className="text-sm text-gray-400">Minimize animations</p>
              </div>
              <button
                onClick={() => updateSettings({ reducedMotion: !settings.reducedMotion })}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.reducedMotion ? 'bg-blue-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.reducedMotion ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Colorblind mode</p>
                <p className="text-sm text-gray-400">Use a colorblind-friendly palette</p>
              </div>
              <button
                onClick={() => updateSettings({ colorblind: !settings.colorblind })}
                aria-label="Toggle colorblind mode"
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings.colorblind ? 'bg-blue-500' : 'bg-white/10'
                }`}
              >
                <div
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    settings.colorblind ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </section>

        {/* Data */}
        <section className="mb-8">
          <h2 className="font-display text-lg font-bold mb-4">Data</h2>
          <div className="bg-white/5 border border-white/[0.08] rounded-xl p-6 space-y-3">
            <button
              onClick={handleClearHistory}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg transition-all"
            >
              <div className="text-left">
                <p className="font-medium text-white">Clear history</p>
                <p className="text-sm text-gray-400">Remove recently played games</p>
              </div>
              <Trash2 size={16} className="text-gray-400" />
            </button>

            <button
              onClick={handleClearFavorites}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg transition-all"
            >
              <div className="text-left">
                <p className="font-medium text-white">Clear favorites</p>
                <p className="text-sm text-gray-400">Remove all favorite games</p>
              </div>
              <Trash2 size={16} className="text-gray-400" />
            </button>

            <button
              onClick={handleClearScores}
              className="w-full flex items-center justify-between px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-lg transition-all"
            >
              <div className="text-left">
                <p className="font-medium text-white">Clear high scores</p>
                <p className="text-sm text-gray-400">Reset all game scores</p>
              </div>
              <Trash2 size={16} className="text-gray-400" />
            </button>

            <button
              onClick={handleResetAll}
              className="w-full flex items-center justify-between px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all"
            >
              <div className="text-left">
                <p className="font-medium text-red-400">Reset all data</p>
                <p className="text-sm text-red-400/70">Clear all scores, history, favorites, and settings</p>
              </div>
              <RotateCcw size={16} className="text-red-400" />
            </button>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="font-display text-lg font-bold mb-4">About</h2>
          <div className="bg-white/5 border border-white/[0.08] rounded-xl p-6">
            <p className="text-gray-400 mb-2">Game Hub v1.0</p>
            <p className="text-sm text-gray-500">34 browser games · Built with React, TypeScript, Vite & Tailwind CSS</p>
          </div>
        </section>
      </div>
    </div>
  );
}
