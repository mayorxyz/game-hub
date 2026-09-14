import { describe, it, expect } from 'vitest';
import { mulberry32, hashString, getDailyRNG, getTodayKey, getDateKey } from './random';

describe('mulberry32', () => {
  it('is deterministic for a given seed', () => {
    const a = mulberry32(1234);
    const b = mulberry32(1234);
    const seqA = Array.from({ length: 10 }, () => a());
    const seqB = Array.from({ length: 10 }, () => b());
    expect(seqA).toEqual(seqB);
  });

  it('different seeds give different sequences', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    expect(Array.from({ length: 5 }, () => a())).not.toEqual(Array.from({ length: 5 }, () => b()));
  });

  it('outputs are in [0, 1)', () => {
    const rng = mulberry32(99);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('hashString', () => {
  it('is deterministic', () => {
    expect(hashString('2026-09-14')).toBe(hashString('2026-09-14'));
  });

  it('differs for different inputs', () => {
    expect(hashString('a')).not.toBe(hashString('b'));
  });

  it('is non-negative', () => {
    for (const s of ['daily', 'challenge', '2026-01-01', 'zzz', '']) {
      expect(hashString(s)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('daily RNG helpers', () => {
  it('getDailyRNG is deterministic per date key', () => {
    const a = getDailyRNG('2026-09-14');
    const b = getDailyRNG('2026-09-14');
    expect(a()).toBe(b());
  });

  it('different days give different seeds', () => {
    const a = getDailyRNG('2026-09-14');
    const b = getDailyRNG('2026-09-15');
    expect([a(), a()]).not.toEqual([b(), b()]);
  });

  it('getTodayKey matches YYYY-MM-DD and equals getDateKey(0)', () => {
    expect(getTodayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(getTodayKey()).toBe(getDateKey(0));
  });

  it('getDateKey walks backwards across days', () => {
    expect(getDateKey(1)).not.toBe(getDateKey(0));
    // 2 days ago must differ from yesterday and today
    expect(getDateKey(2)).not.toBe(getDateKey(1));
  });
});
