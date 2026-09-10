import React, { useState, useEffect, useRef } from 'react';
import GameLayout from '../../components/ui/GameLayout';
import { getHighScore, setHighScore } from '../../lib/storage';

const TEXTS = [
  'The quick brown fox jumps over the lazy dog near the riverbank.',
  'Programming is the art of telling a computer what to do in detail.',
  'Every great developer you know got there by solving problems they were unqualified to solve.',
  'Code is like humor when you have to explain it its bad.',
  'The best error message is the one that never shows up.',
];

export default function TypingGame() {
  const [text, setText] = useState('');
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [highScore, setHS] = useState(getHighScore('typing-game'));
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const start = () => {
    const t = TEXTS[Math.floor(Math.random() * TEXTS.length)];
    setText(t);
    setInput('');
    setStartTime(Date.now());
    setWpm(0);
    setFinished(false);
    setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  useEffect(() => {
    if (!started || finished) return;
    const elapsed = (Date.now() - startTime) / 60000;
    const words = input.trim().split(/\s+/).length;
    if (elapsed > 0) setWpm(Math.round(words / elapsed));
  }, [input, started, finished]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (finished) return;
    const val = e.target.value;
    setInput(val);
    if (val === text) {
      setFinished(true);
      const elapsed = (Date.now() - startTime) / 60000;
      const words = text.trim().split(/\s+/).length;
      const finalWpm = Math.round(words / elapsed);
      setWpm(finalWpm);
      setHS(h => {
        const best = Math.max(h, finalWpm);
        setHighScore('typing-game', best);
        return best;
      });
    }
  };

  const accuracy = (() => {
    let correct = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === text[i]) correct++;
    }
    return input.length > 0 ? Math.round((correct / input.length) * 100) : 100;
  })();

  const reset = start;

  return (
    <GameLayout title="Typing Game" score={finished ? `${wpm} WPM` : started ? `${wpm} WPM` : undefined} highScore={highScore} onReset={reset}>
      <div className="flex flex-col items-center justify-between w-full h-full gap-4 max-w-lg mx-auto">
        {!started && (
          <button onClick={start} className="min-h-[48px] px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 active:from-indigo-600 active:to-purple-600 rounded-lg font-bold" style={{ touchAction: 'manipulation' }}>Start Typing</button>
        )}
        {finished && <p className="text-green-400 text-xl font-bold">🎉 {wpm} WPM · {accuracy}% accuracy</p>}

        {started && (
          <>
            <div className="bg-gray-800 p-4 rounded-xl w-full text-sm sm:text-base font-mono leading-relaxed overflow-auto">
              {text.split('').map((ch, i) => (
                <span key={i} className={
                  i < input.length
                    ? input[i] === ch ? 'text-green-400' : 'text-red-400 bg-red-900/30'
                    : i === input.length ? 'text-white bg-gray-600' : 'text-gray-500'
                }>
                  {ch}
                </span>
              ))}
            </div>
            <input
              ref={inputRef}
              value={input}
              onChange={handleChange}
              disabled={finished}
              className="w-full min-h-[48px] bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-purple-500"
              placeholder="Start typing..."
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{ touchAction: 'manipulation' }}
            />
            <div className="flex gap-4 text-sm text-gray-400">
              <span>WPM: <span className="text-white font-bold">{wpm}</span></span>
              <span>Accuracy: <span className="text-white font-bold">{accuracy}%</span></span>
            </div>
          </>
        )}
      </div>
    </GameLayout>
  );
}
