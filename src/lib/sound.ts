// Lightweight WebAudio sound engine — zero dependencies, oscillator-based.
import { getSettings, updateSettings } from './persistence';

export type SoundEffect = 'click' | 'move' | 'success' | 'gameover' | 'highscore' | 'tick';

let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Resume on first user gesture (browsers block autoplay)
if (typeof window !== 'undefined') {
  const resume = () => {
    const c = getContext();
    if (c && c.state === 'suspended') c.resume();
  };
  window.addEventListener('pointerdown', resume);
  window.addEventListener('keydown', resume);
}

function tone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15, delay = 0) {
  const c = getContext();
  if (!c) return;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = c.currentTime + delay;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(gain);
  gain.connect(c.destination);
  osc.start(t);
  osc.stop(t + duration);
}

const EFFECTS: Record<SoundEffect, () => void> = {
  click: () => tone(600, 0.06, 'square', 0.07),
  move: () => tone(300, 0.05, 'triangle', 0.1),
  success: () => { tone(523, 0.1, 'sine', 0.15); tone(784, 0.12, 'sine', 0.15, 0.08); },
  gameover: () => { tone(300, 0.2, 'sawtooth', 0.12); tone(200, 0.3, 'sawtooth', 0.12, 0.15); },
  highscore: () => { tone(659, 0.1, 'square', 0.15); tone(880, 0.1, 'square', 0.15, 0.1); tone(1047, 0.15, 'square', 0.15, 0.2); },
  tick: () => tone(900, 0.04, 'square', 0.06),
};

export function playSound(effect: SoundEffect): void {
  if (!getSettings().soundEnabled) return;
  EFFECTS[effect]();
}

export function playTone(freq: number, duration = 0.15, type: OscillatorType = 'sine'): void {
  if (!getSettings().soundEnabled) return;
  tone(freq, duration, type);
}

export function setSoundEnabled(enabled: boolean): void {
  updateSettings({ soundEnabled: enabled });
  if (ctx) {
    if (enabled) ctx.resume();
    else ctx.suspend();
  }
}