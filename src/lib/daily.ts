// Daily challenge system

import { getTodayKey, getDateKey, getDailyRNG } from './random';
import { getDailyProgress, setDailyProgress, type DailyProgressEntry } from './persistence';

// Curated list of games for daily challenges
const DAILY_GAMES = ['wordle', 'sudoku', 'minesweeper', 'memory-match', 'word-search', 'game-2048'];

// Get today's featured game based on day of year
export function getDailyGame(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = dayOfYear % DAILY_GAMES.length;
  return DAILY_GAMES[index];
}

// Get daily seed for a specific game
export function getDailySeed(gameId: string): number {
  const dateKey = getTodayKey();
  const rng = getDailyRNG(`${dateKey}_${gameId}`);
  return Math.floor(rng() * 1000000);
}

// Check if today's challenge is completed
export function isDailyCompleted(): boolean {
  const progress = getDailyProgress();
  const todayKey = getTodayKey();
  return todayKey in progress;
}

// Record daily challenge completion
export function completeDailyChallenge(gameId: string, won: boolean, score: number): void {
  const dateKey = getTodayKey();
  const entry: DailyProgressEntry = { gameId, won, score };
  setDailyProgress(dateKey, entry);
}

// Calculate current streak (consecutive days with completed challenges)
export function getCurrentStreak(): number {
  const progress = getDailyProgress();
  let streak = 0;
  let daysAgo = 0;

  while (true) {
    const dateKey = getDateKey(daysAgo);
    if (dateKey in progress) {
      streak++;
      daysAgo++;
    } else {
      break;
    }
  }

  return streak;
}

// Calculate longest streak ever
export function getLongestStreak(): number {
  const progress = getDailyProgress();
  const dates = Object.keys(progress).sort();
  
  if (dates.length === 0) return 0;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1]);
    const currDate = new Date(dates[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

// Get total days played
export function getTotalDaysPlayed(): number {
  const progress = getDailyProgress();
  return Object.keys(progress).length;
}

// Get time until next daily challenge resets (in milliseconds)
export function getTimeUntilReset(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

// Format time until reset as HH:MM:SS
export function formatTimeUntilReset(): string {
  const ms = getTimeUntilReset();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
