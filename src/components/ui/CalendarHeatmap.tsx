import React from 'react';
import { getDailyProgress, type DailyProgressEntry } from '../../lib/persistence';
import { getDateKey } from '../../lib/random';

// GitHub-style calendar heatmap showing last 180 days
export default function CalendarHeatmap() {
  const progress = getDailyProgress();
  
  // Generate last 180 days (roughly 26 weeks)
  const days: { dateKey: string; entry?: DailyProgressEntry; date: Date }[] = [];
  for (let i = 179; i >= 0; i--) {
    const dateKey = getDateKey(i);
    const date = new Date(dateKey);
    days.push({
      dateKey,
      entry: progress[dateKey],
      date,
    });
  }

  // Group into weeks (columns)
  const weeks: typeof days[] = [];
  let currentWeek: typeof days = [];
  
  days.forEach((day, index) => {
    // Start new week on Sunday
    if (day.date.getDay() === 0 || index === 0) {
      if (currentWeek.length > 0) {
        weeks.push(currentWeek);
      }
      currentWeek = [day];
    } else {
      currentWeek.push(day);
    }
  });
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Get intensity level based on score
  const getIntensity = (entry?: DailyProgressEntry): number => {
    if (!entry) return 0;
    if (!entry.won) return -1; // played but lost
    if (entry.score >= 1000) return 4;
    if (entry.score >= 500) return 3;
    if (entry.score >= 100) return 2;
    return 1;
  };

  const getColor = (intensity: number): string => {
    if (intensity < 0) return 'bg-red-800'; // lost
    return intensityColors[intensity];
  };

  const intensityColors = [
    'bg-gray-800', // No activity
    'bg-green-900', // Low
    'bg-green-700', // Medium
    'bg-green-500', // High
    'bg-green-400', // Very high
  ];

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day) => {
              const intensity = getIntensity(day.entry);
              const colorClass = getColor(intensity);
              const tooltip = day.entry 
                ? `${day.dateKey}: ${day.entry.won ? 'Won' : 'Lost'} (${day.entry.score} pts)`
                : `${day.dateKey}: No activity`;
              
              return (
                <div
                  key={day.dateKey}
                  className={`w-3 h-3 rounded-sm ${colorClass} cursor-pointer hover:ring-2 hover:ring-white/20 transition-all`}
                  title={tooltip}
                />
              );
            })}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-gray-400">
        <span>Less</span>
        {intensityColors.map((color, i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${color}`} />
        ))}
        <span>More</span>
        <div className="w-3 h-3 rounded-sm bg-red-800 ml-2" />
        <span>Lost</span>
      </div>
    </div>
  );
}
