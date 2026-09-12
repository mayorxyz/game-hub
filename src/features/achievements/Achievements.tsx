import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { ACHIEVEMENTS, getAchievementProgress } from '../../lib/achievements';
import { useStats } from '../../hooks/useStats';
import { useAchievements } from '../../hooks/useAchievements';

export default function Achievements() {
  const { stats } = useStats();
  const { unlocked } = useAchievements();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative border-b border-white/[0.08]">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-orange-500/5 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Trophy size={16} className="text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Achievements</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
              Your Achievements
            </h1>
            <p className="text-lg text-gray-400">
              {unlocked.length} / {ACHIEVEMENTS.length} unlocked
            </p>
          </motion.div>
        </div>
      </section>

      {/* Achievements Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ACHIEVEMENTS.map((achievement, index) => {
            const isUnlocked = unlocked.includes(achievement.id);
            const progress = getAchievementProgress(achievement, stats);

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className={`relative bg-white/5 border border-white/[0.08] rounded-xl p-6 transition-all ${
                  isUnlocked ? 'hover:bg-white/10' : 'opacity-60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                    isUnlocked 
                      ? 'bg-gradient-to-br from-yellow-500 to-orange-500' 
                      : 'bg-gray-800'
                  }`}>
                    {isUnlocked ? (
                      <Trophy size={24} className="text-white" />
                    ) : (
                      <Lock size={24} className="text-gray-500" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold mb-1 ${isUnlocked ? 'text-white' : 'text-gray-400'}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {achievement.description}
                    </p>
                    
                    {!isUnlocked && (
                      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 h-full transition-all duration-500"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
