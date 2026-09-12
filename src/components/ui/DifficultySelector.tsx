import React from 'react';
import { Difficulty } from '../../lib/difficulty';

interface DifficultySelectorProps {
  value: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

export default function DifficultySelector({ value, onChange, disabled = false }: DifficultySelectorProps) {
  const difficulties: Difficulty[] = ['easy', 'medium', 'hard'];

  return (
    <div className="flex gap-1 bg-white/5 rounded-lg p-1">
      {difficulties.map((difficulty) => (
        <button
          key={difficulty}
          onClick={() => onChange(difficulty)}
          disabled={disabled}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            value === difficulty
              ? 'bg-blue-500 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/10'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </button>
      ))}
    </div>
  );
}
