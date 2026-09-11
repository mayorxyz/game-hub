import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/persistence';
import VirtualDPad from '../../components/ui/controls/VirtualDPad';
import TouchControlContainer from '../../components/ui/controls/TouchControlContainer';
import {
  LEVELS,
  parseLevel,
  SokobanState,
  createInitialState,
  checkWin,
} from './Sokoban';
import { handleDirectionInput } from './Sokoban.controls';

export default function Sokoban() {
  const [levelIndex, setLevelIndex] = useState(0);
  const parsed = parseLevel(LEVELS[0]);
  const [boxes, setBoxes] = useState<Set<string>>(() => new Set(parsed.boxes));
  const [player, setPlayer] = useState<[number, number]>(() => parsed.player);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const storedBest = getHighScore('sokoban');
  const [bestMoves, setBestMoves] = useState<number>(storedBest > 0 ? 10000 - storedBest : Infinity);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (won) return;
      let dr = 0;
      let dc = 0;
      if (e.key === 'ArrowUp' || e.key === 'w') dr = -1;
      else if (e.key === 'ArrowDown' || e.key === 's') dr = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a') dc = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd') dc = 1;
      else return;

      e.preventDefault();
      const [pr, pc] = player;
      const nr = pr + dr;
      const nc = pc + dc;

      if (nr < 0 || nr >= parsed.rows || nc < 0 || nc >= parsed.cols || parsed.walls[nr][nc]) return;

      const k = `${nr},${nc}`;
      const nb = new Set(boxes);

      if (nb.has(k)) {
        const br = nr + dr;
        const bc = nc + dc;
        if (br < 0 || br >= parsed.rows || bc < 0 || bc >= parsed.cols || parsed.walls[br][bc] || nb.has(`${br},${bc}`)) return;
        nb.delete(k);
        nb.add(`${br},${bc}`);
        setBoxes(nb);
      }

      setPlayer([nr, nc]);
      setMoves(m => m + 1);

      if ([...parsed.targets].every(t => nb.has(t))) setWon(true);
    };

    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [player, boxes, parsed, won]);

  const reset = () => {
    setBoxes(new Set(parsed.boxes));
    setPlayer(parsed.player);
    setMoves(0);
    setWon(false);
  };

  useEffect(() => {
    if (won && moves > 0 && moves < bestMoves) {
      setBestMoves(moves);
      setHighScore('sokoban', 10000 - moves);
    }
  }, [won, moves, bestMoves]);

  const handleDirectionPress = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (won) return;
    let dr = 0;
    let dc = 0;
    if (direction === 'up') dr = -1;
    else if (direction === 'down') dr = 1;
    else if (direction === 'left') dc = -1;
    else if (direction === 'right') dc = 1;

    const [pr, pc] = player;
    const nr = pr + dr;
    const nc = pc + dc;

    if (nr < 0 || nr >= parsed.rows || nc < 0 || nc >= parsed.cols || parsed.walls[nr][nc]) return;

    const k = `${nr},${nc}`;
    const nb = new Set(boxes);

    if (nb.has(k)) {
      const br = nr + dr;
      const bc = nc + dc;
      if (br < 0 || br >= parsed.rows || bc < 0 || bc >= parsed.cols || parsed.walls[br][bc] || nb.has(`${br},${bc}`)) return;
      nb.delete(k);
      nb.add(`${br},${bc}`);
      setBoxes(nb);
    }

    setPlayer([nr, nc]);
    setMoves(m => m + 1);

    if ([...parsed.targets].every(t => nb.has(t))) setWon(true);
  };

  return (
    <GameLayout
      title="Sokoban"
      score={`${moves} moves`}
      highScore={bestMoves !== Infinity ? bestMoves : undefined}
      onReset={reset}
    >
      <div className="flex flex-col items-center justify-center w-full h-full gap-4">
        {won && <p className="text-green-400">🎉 Complete!</p>}

        {/* Responsive Game Grid */}
        <div className="relative w-full max-w-[min(90vw,60vh)] aspect-square">
          <div className="absolute inset-0 bg-gray-900 p-1 rounded overflow-hidden">
            <div
              className="grid h-full w-full gap-0"
              style={{
                gridTemplateColumns: `repeat(${parsed.cols}, 1fr)`,
                gridTemplateRows: `repeat(${parsed.rows}, 1fr)`,
              }}
            >
              {Array.from({ length: parsed.rows * parsed.cols }, (_, i) => {
                const r = Math.floor(i / parsed.cols);
                const c = i % parsed.cols;
                const k = `${r},${c}`;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-xs sm:text-sm ${
                      parsed.walls[r]?.[c]
                        ? 'bg-gray-600'
                        : parsed.targets.has(k)
                        ? 'bg-gray-800'
                        : 'bg-gray-900'
                    }`}
                  >
                    {boxes.has(k) ? '📦' : parsed.targets.has(k) ? '⭐' : player[0] === r && player[1] === c ? '🧑' : ''}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile Touch Controls */}
        <TouchControlContainer>
          <div className="flex justify-center">
            <VirtualDPad onDirectionPress={handleDirectionPress} />
          </div>
        </TouchControlContainer>
      </div>
    </GameLayout>
  );
}
