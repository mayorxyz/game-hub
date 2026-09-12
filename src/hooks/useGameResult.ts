import { useCallback } from 'react';
import { finishGame, type GameResult, type FinishOptions } from '../lib/gameResult';

// Records a game result. Games should call `record` from an effect keyed on the
// game-over boolean transition (e.g. useEffect(..., [isGameOver])), which fires
// exactly once per finished game.
export function useGameResult(gameId: string, options: FinishOptions = {}) {
  const record = useCallback(
    (result: GameResult) => {
      finishGame(gameId, result, options);
    },
    [gameId, options.daily]
  );

  return { record };
}