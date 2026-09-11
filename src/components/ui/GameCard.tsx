import React from 'react';
import { Link } from 'react-router-dom';

interface GameCardProps {
  id: string;
  name: string;
  category: string;
  path: string;
  icon: string;
}

export default function GameCard({ name, category, path, icon }: GameCardProps) {
  return (
    <Link
      to={path}
      className="group relative overflow-hidden rounded-2xl bg-gray-800 border border-gray-700 p-4 sm:p-6 transition-all duration-300 hover:scale-[1.03] hover:border-gray-500 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      <div className="relative flex flex-col items-center gap-2 sm:gap-3">
        <span className="text-3xl sm:text-4xl" role="img" aria-label={name}>{icon}</span>
        <h3 className="text-sm sm:text-base font-semibold text-white text-center leading-tight">{name}</h3>
        <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium">
          {category}
        </span>
      </div>
    </Link>
  );
}
