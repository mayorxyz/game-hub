import React, { useState, useEffect } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

const WORDS = ['REACT', 'WORLD', 'CRANE', 'SLATE', 'TRACE', 'ARISE', 'AUDIO', 'STARE', 'ROAST', 'PIZZA', 'GHOST', 'BLAZE', 'FROST', 'DREAM', 'LIGHT', 'MUSIC', 'OCEAN', 'STORM', 'FLAME', 'STONE'];
const WORD_LEN = 5;
const MAX_GUESSES = 6;

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

function evaluateGuess(guess: string, target: string): LetterState[] {
  const result: LetterState[] = Array(WORD_LEN).fill('absent');
  const targetArr = target.split('');
  const guessArr = guess.split('');
  for (let i = 0; i < WORD_LEN; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = 'correct';
      targetArr[i] = '#';
      guessArr[i] = '*';
    }
  }
  for (let i = 0; i < WORD_LEN; i++) {
    if (guessArr[i] === '*') continue;
    const idx = targetArr.indexOf(guessArr[i]);
    if (idx !== -1) {
      result[i] = 'present';
      targetArr[idx] = '#';
    }
  }
  return result;
}

const stateColors: Record<LetterState, string> = {
  correct: 'bg-green-600 border-green-600',
  present: 'bg-yellow-600 border-yellow-600',
  absent: 'bg-gray-700 border-gray-700',
  empty: 'bg-gray-800 border-gray-600',
};

export default function Wordle() {
  const [target] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [highScore, setHS] = useState(getHighScore('wordle'));

  const evaluations = guesses.map(g => evaluateGuess(g, target));

  const submitGuess = () => {
    if (current.length !== WORD_LEN || gameOver) return;
    const newGuesses = [...guesses, current];
    setGuesses(newGuesses);
    setCurrent('');
    if (current === target) {
      setWon(true);
      setGameOver(true);
      const score = MAX_GUESSES - newGuesses.length + 1;
      setHS(h => {
        const best = Math.max(h, score * 100);
        setHighScore('wordle', best);
        return best;
      });
    } else if (newGuesses.length >= MAX_GUESSES) {
      setGameOver(true);
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      if (e.key === 'Enter') submitGuess();
      else if (e.key === 'Backspace') setCurrent(c => c.slice(0, -1));
      else if (/^[a-zA-Z]$/.test(e.key) && current.length < WORD_LEN) {
        setCurrent(c => c + e.key.toUpperCase());
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [current, gameOver]);

  const reset = () => {
    setGuesses([]);
    setCurrent('');
    setGameOver(false);
    setWon(false);
  };

  const rows = Array.from({ length: MAX_GUESSES }, (_, i) => {
    if (i < guesses.length) {
      return { letters: guesses[i].split(''), states: evaluations[i] };
    }
    if (i === guesses.length) {
      return {
        letters: current.split('').concat(Array(WORD_LEN - current.length).fill('')),
        states: Array(WORD_LEN).fill('empty') as LetterState[]
      };
    }
    return { letters: Array(WORD_LEN).fill(''), states: Array(WORD_LEN).fill('empty') as LetterState[] };
  });

  return (
    <GameLayout title="Wordle" score={won ? `${MAX_GUESSES - guesses.length + 1}/6` : undefined} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        {won && <p className="text-green-400 text-xl font-bold">🎉 Got it in {guesses.length}!</p>}
        {gameOver && !won && <p className="text-red-400 text-xl font-bold">The word was: {target}</p>}

        <div className="flex flex-col gap-1">
          {rows.map((row, ri) => (
            <div key={ri} className="flex gap-1">
              {row.letters.map((l, ci) => (
                <div key={ci} className={`w-12 h-12 sm:w-14 sm:h-14 border-2 flex items-center justify-center text-xl sm:text-2xl font-bold rounded ${stateColors[row.states[ci]]}`}>
                  {l}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-1 max-w-sm">
          {['QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'].map((row, ri) => (
            <div key={ri} className="flex gap-1 mb-1">
              {row.split('').map(letter => {
                let state: LetterState = 'empty';
                for (let i = guesses.length - 1; i >= 0; i--) {
                  const ev = evaluations[i];
                  const idx = guesses[i].indexOf(letter);
                  if (idx !== -1) {
                    state = ev[idx];
                    break;
                  }
                }
                return (
                  <button
                    key={letter}
                    onClick={() => setCurrent(c => c.length < WORD_LEN ? c + letter : c)}
                    className={`min-w-[48px] min-h-[48px] rounded text-xs sm:text-sm font-bold ${
                      state === 'correct' ? 'bg-green-600' :
                      state === 'present' ? 'bg-yellow-600' :
                      state === 'absent' ? 'bg-gray-700' :
                      'bg-gray-600 hover:bg-gray-500 active:bg-gray-400'
                    } text-white`}
                    style={{ touchAction: 'manipulation' }}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}
          <button onClick={submitGuess} className="min-w-[48px] min-h-[48px] px-3 bg-green-600 hover:bg-green-500 active:bg-green-400 rounded text-sm font-bold text-white" style={{ touchAction: 'manipulation' }}>⏎</button>
          <button onClick={() => setCurrent(c => c.slice(0, -1))} className="px-3 h-10 bg-gray-600 rounded text-sm font-bold text-white">⌫</button>
        </div>
      </div>
    </GameLayout>
  );
}
