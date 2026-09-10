import React, { useState } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

const WORDS = ['JAVASCRIPT', 'PYTHON', 'ELEPHANT', 'GUITAR', 'MOUNTAIN', 'BUTTERFLY', 'CHOCOLATE', 'ADVENTURE', 'DINOSAUR', 'UNIVERSE'];
const PARTS = 6;

export default function Hangman() {
  const [word, setWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guessed, setGuessed] = useState<Set<string>>(new Set());
  const [highScore, setHS] = useState(getHighScore('hangman'));
  const [streak, setStreak] = useState(0);

  const wrongGuesses = [...guessed].filter(l => !word.includes(l)).length;
  const isWon = word.split('').every(l => guessed.has(l));
  const isLost = wrongGuesses >= PARTS;

  const guess = (letter: string) => {
    if (isWon || isLost || guessed.has(letter)) return;
    const newGuessed = new Set(guessed);
    newGuessed.add(letter);
    setGuessed(newGuessed);

    if (word.split('').every(l => newGuessed.has(l))) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setHS(h => {
        const best = Math.max(h, newStreak);
        setHighScore('hangman', best);
        return best;
      });
    }
  };

  const reset = () => {
    setWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setGuessed(new Set());
    if (isLost) setStreak(0);
  };

  return (
    <GameLayout title="Hangman" score={`Streak: ${streak}`} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center justify-between w-full h-full gap-4">
        <div className="text-4xl sm:text-5xl h-16 flex items-center justify-center">
          {wrongGuesses >= 1 && '😵'}
          {wrongGuesses === 0 && '😊'}
        </div>

        <div className="flex gap-1 sm:gap-2 text-xl sm:text-2xl font-mono">
          {word.split('').map((l, i) => (
            <span key={i} className={`w-7 h-9 sm:w-9 sm:h-11 border-b-2 flex items-center justify-center font-bold ${guessed.has(l) || isLost ? 'text-white' : 'text-transparent'}`}>
              {guessed.has(l) || isLost ? l : '_'}
            </span>
          ))}
        </div>

        {isWon && <p className="text-green-400 text-xl font-bold">🎉 You got it!</p>}
        {isLost && <p className="text-red-400 text-xl font-bold">💀 The word was: {word}</p>}

        <div className="flex flex-wrap justify-center gap-1 sm:gap-2 max-w-md">
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <button
              key={letter}
              onClick={() => guess(letter)}
              disabled={guessed.has(letter) || isWon || isLost}
              className={`min-w-[48px] min-h-[48px] rounded-lg text-xs sm:text-sm font-bold transition-all ${
                guessed.has(letter)
                  ? word.includes(letter) ? 'bg-green-600 text-white' : 'bg-red-600/50 text-gray-400'
                  : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-white'
              } disabled:cursor-not-allowed`}
              style={{ touchAction: 'manipulation' }}
            >
              {letter}
            </button>
          ))}
        </div>

        <p className="text-gray-500 text-xs">{PARTS - wrongGuesses} guesses remaining</p>
      </div>
    </GameLayout>
  );
}
