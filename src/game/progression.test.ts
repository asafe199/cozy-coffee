import { MAX_LEVEL } from './levels';
import { isLevelUnlocked, nextLevel, unlockedLevels } from './progression';

test('level 1 is always unlocked', () => {
  expect(isLevelUnlocked(1, false)).toBe(true);
  expect(isLevelUnlocked(1, true)).toBe(true);
});

test('levels 2-5 need the purchase', () => {
  for (let l = 2; l <= MAX_LEVEL; l++) {
    expect(isLevelUnlocked(l, false)).toBe(false);
    expect(isLevelUnlocked(l, true)).toBe(true);
  }
});

test('out-of-range levels are locked', () => {
  for (const l of [0, -1, MAX_LEVEL + 1, 1.5, NaN]) {
    expect(isLevelUnlocked(l, true)).toBe(false);
  }
});

test('unlockedLevels lists unlocked levels', () => {
  expect(unlockedLevels(false)).toEqual([1]);
  expect(unlockedLevels(true)).toEqual([1, 2, 3, 4, 5]);
});

test('nextLevel advances until max, then null', () => {
  expect(nextLevel(1)).toBe(2);
  expect(nextLevel(MAX_LEVEL - 1)).toBe(MAX_LEVEL);
  expect(nextLevel(MAX_LEVEL)).toBeNull();
  expect(nextLevel(0)).toBeNull();
});
