import { useCallback } from 'react';
import { playSound, type SoundEffect } from '../lib/sound';

export function useSound() {
  return useCallback((effect: SoundEffect) => playSound(effect), []);
}