import { MAX_LEVEL } from './levels';

export function isLevelUnlocked(level: number, purchased: boolean): boolean {
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) return false;
  return level === 1 || purchased;
}

export function unlockedLevels(purchased: boolean): number[] {
  const levels: number[] = [];
  for (let level = 1; level <= MAX_LEVEL; level++) {
    if (isLevelUnlocked(level, purchased)) levels.push(level);
  }
  return levels;
}

export function nextLevel(level: number): number | null {
  if (!Number.isInteger(level) || level < 1 || level >= MAX_LEVEL) return null;
  return level + 1;
}
