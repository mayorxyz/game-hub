import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import type { Achievement } from '../../lib/achievements';

interface Toast {
  id: number;
  achievement: Achievement;
}

export default function AchievementToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Achievement[]>).detail;
      if (!Array.isArray(detail) || detail.length === 0) return;
      const incoming: Toast[] = detail.map((a, i) => ({
        id: Date.now() + i,
        achievement: a,
      }));
      setToasts(prev => [...prev, ...incoming]);
      incoming.forEach(t => {
        setTimeout(() => {
          setToasts(prev => prev.filter(x => x.id !== t.id));
        }, 4500);
      });
    };
    window.addEventListener('gamehub:achievements', handler);
    return () => window.removeEventListener('gamehub:achievements', handler);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-auto flex items-center gap-3 bg-[#111111] border border-yellow-500/30 rounded-xl px-4 py-3 shadow-2xl max-w-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <div className="text-xs font-bold text-yellow-400 uppercase tracking-wide">Achievement Unlocked</div>
              <div className="text-sm text-white font-semibold">{t.achievement.name}</div>
              <div className="text-xs text-gray-400">{t.achievement.description}</div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}