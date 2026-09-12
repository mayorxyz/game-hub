// Achievement definitions and checker

import { getGameStats, getUnlockedAchievements, unlockAchievement, type GameStats } from './persistence';
import { getCurrentStreak, getLongestStreak, getTotalDaysPlayed } from './daily';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
  target: number;
  progress?: (stats: GameStats) => number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Playing milestones
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Play your first game',
    icon: 'Sword',
    target: 1,
    progress: (stats) => stats.gamesPlayed,
  },
  {
    id: 'warming-up',
    name: 'Warming Up',
    description: 'Play 10 games',
    icon: 'Flame',
    target: 10,
    progress: (stats) => stats.gamesPlayed,
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Play 100 games',
    icon: 'Shield',
    target: 100,
    progress: (stats) => stats.gamesPlayed,
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Play 500 games',
    icon: 'Timer',
    target: 500,
    progress: (stats) => stats.gamesPlayed,
  },

  // Winning milestones
  {
    id: 'first-win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: 'Trophy',
    target: 1,
    progress: (stats) => stats.gamesWon,
  },
  {
    id: 'winner',
    name: 'Winner',
    description: 'Win 10 games',
    icon: 'Award',
    target: 10,
    progress: (stats) => stats.gamesWon,
  },
  {
    id: 'champion',
    name: 'Champion',
    description: 'Win 50 games',
    icon: 'Crown',
    target: 50,
    progress: (stats) => stats.gamesWon,
  },

  // Score milestones
  {
    id: 'high-scorer',
    name: 'High Scorer',
    description: 'Reach a total score of 10,000',
    icon: 'TrendingUp',
    target: 10000,
    progress: (stats) => stats.totalScore,
  },
  {
    id: 'legend',
    name: 'Legend',
    description: 'Reach a total score of 100,000',
    icon: 'Star',
    target: 100000,
    progress: (stats) => stats.totalScore,
  },

  // Streak achievements
  {
    id: 'streak-3',
    name: 'On Fire',
    description: 'Maintain a 3-day streak',
    icon: 'Flame',
    target: 3,
    progress: () => getLongestStreak(),
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'Flame',
    target: 7,
    progress: () => getLongestStreak(),
  },
  {
    id: 'streak-30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day streak',
    icon: 'Flame',
    target: 30,
    progress: () => getLongestStreak(),
  },

  // Daily challenge achievements
  {
    id: 'daily-10',
    name: 'Daily Devotee',
    description: 'Complete 10 daily challenges',
    icon: 'Calendar',
    target: 10,
    progress: () => getTotalDaysPlayed(),
  },
  {
    id: 'daily-30',
    name: 'Monthly Champion',
    description: 'Complete 30 daily challenges',
    icon: 'Calendar',
    target: 30,
    progress: () => getTotalDaysPlayed(),
  },

  // Collection achievements
  {
    id: 'explorer',
    name: 'Explorer',
    description: 'Play 10 different games',
    icon: 'Compass',
    target: 10,
    progress: (stats) => Object.keys(stats.perGame).length,
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Play every game at least once',
    icon: 'Package',
    target: 30,
    progress: (stats) => Object.keys(stats.perGame).length,
  },

  // Game-specific achievements
  {
    id: 'snake-master',
    name: 'Snake Master',
    description: 'Score 500+ in Snake',
    icon: 'Zap',
    target: 500,
    progress: (stats) => stats.perGame['snake']?.bestScore || 0,
  },
  {
    id: '2048-master',
    name: '2048 Master',
    description: 'Reach the 2048 tile',
    icon: 'Hash',
    target: 2048,
    progress: (stats) => stats.perGame['2048']?.bestScore || 0,
  },
  {
    id: 'wordle-streak',
    name: 'Word Streak',
    description: 'Win Wordle 5 times',
    icon: 'Type',
    target: 5,
    progress: (stats) => stats.perGame['wordle']?.wins || 0,
  },
];

// Check for newly unlocked achievements
export function checkAchievements(
  unlockedIds: string[],
  stats: GameStats
): Achievement[] {
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (unlockedIds.includes(achievement.id)) continue;

    const currentProgress = achievement.progress 
      ? achievement.progress(stats)
      : 0;

    if (currentProgress >= achievement.target) {
      newlyUnlocked.push(achievement);
    }
  }

  return newlyUnlocked;
}

// Get achievement by ID
export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find(a => a.id === id);
}

// Get progress for an achievement
export function getAchievementProgress(
  achievement: Achievement,
  stats: GameStats
): number {
  if (!achievement.progress) return 0;
  const current = achievement.progress(stats);
  return Math.min(current / achievement.target, 1);
}

// Check for newly unlocked achievements, persist them, and return the newly unlocked list.
export function checkAndUnlockAchievements(): Achievement[] {
  const unlockedIds = getUnlockedAchievements();
  const stats = getGameStats();
  const newlyUnlocked = checkAchievements(unlockedIds, stats);
  newlyUnlocked.forEach(a => unlockAchievement(a.id));
  return newlyUnlocked;
}