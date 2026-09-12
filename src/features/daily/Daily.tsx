import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Flame, Trophy, Clock, Play } from 'lucide-react';
import { games } from '../../data/games';
import { 
  getDailyGame, 
  isDailyCompleted, 
  getCurrentStreak, 
  getLongestStreak, 
  getTotalDaysPlayed,
  formatTimeUntilReset 
} from '../../lib/daily';
import CalendarHeatmap from '../../components/ui/CalendarHeatmap';

export default function Daily() {
  const [timeUntilReset, setTimeUntilReset] = useState(formatTimeUntilReset());
  const dailyGameId = getDailyGame();
  const dailyGame = games.find(g => g.id === dailyGameId);
  const completed = isDailyCompleted();
  const currentStreak = getCurrentStreak();
  const longestStreak = getLongestStreak();
  const totalDays = getTotalDaysPlayed();

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUntilReset(formatTimeUntilReset());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!dailyGame) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Daily game not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-purple-400" />
              <span className="text-sm font-medium text-purple-400">Daily Challenge</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Today's Challenge
            </h1>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{dailyGame.name}</h2>
                <p className="text-gray-400 mb-4">{dailyGame.shortDescription}</p>
                
                {completed ? (
                  <div className="flex items-center gap-2 text-green-400">
                    <Trophy size={20} />
                    <span className="font-medium">Completed today!</span>
                  </div>
                ) : (
                  <Link
                    to={`/play/${dailyGame.slug}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-all"
                  >
                    <Play size={18} />
                    Play Now
                  </Link>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock size={16} />
                <span>Resets in {timeUntilReset}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white/5 border border-white/[0.08] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Flame size={24} className="text-orange-400" />
              <span className="text-sm text-gray-400">Current Streak</span>
            </div>
            <div className="text-3xl font-bold">{currentStreak} days</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/5 border border-white/[0.08] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Trophy size={24} className="text-yellow-400" />
              <span className="text-sm text-gray-400">Longest Streak</span>
            </div>
            <div className="text-3xl font-bold">{longestStreak} days</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white/5 border border-white/[0.08] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={24} className="text-blue-400" />
              <span className="text-sm text-gray-400">Total Days Played</span>
            </div>
            <div className="text-3xl font-bold">{totalDays} days</div>
          </motion.div>
        </div>

        {/* Calendar Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white/5 border border-white/[0.08] rounded-xl p-6"
        >
          <h3 className="font-display text-xl font-bold mb-6">Activity</h3>
          <CalendarHeatmap />
        </motion.div>
      </section>
    </div>
  );
}
