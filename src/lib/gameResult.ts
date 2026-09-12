// Single entry point for finishing a game: records stats, daily progress, and unlocks achievements.
import { recordGameResult } from './persistence';
import { checkAndUnlockAchievements, type Achievement } from './achievements';
import { completeDailyChallenge } from './daily';
import { playSound } from './sound';

export interface GameResult {
  won: boolean;
  score: number;
  durationMs?: number;
}

export interface FinishOptions {
  daily?: boolean;
}

export function finishGame(
  gameId: string,
  result: GameResult,
  options: FinishOptions = {}
): Achievement[] {
  recordGameResult(gameId, result);
  playSound(result.won ? 'success' : 'gameover');

  if (options.daily) {
    completeDailyChallenge(gameId, result.won, result.score);
  }

  const unlocked = checkAndUnlockAchievements();

  if (unlocked.length > 0) {
    window.dispatchEvent(
      new CustomEvent<Achievement[]>('gamehub:achievements', { detail: unlocked })
    );
  }

  return unlocked;
}