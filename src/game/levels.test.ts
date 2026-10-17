import { canUpgrade, recipesForLevel, upgradeCost, MAX_LEVEL } from './levels';

test('level 1 serves coffee only, level 2 adds toast', () => {
  expect(recipesForLevel(1)).toEqual(['coffee']);
  expect(recipesForLevel(2)).toEqual(['coffee', 'toast']);
});

test('upgrade cost exists until max level', () => {
  expect(upgradeCost(1)).toBe(60);
  expect(upgradeCost(MAX_LEVEL)).toBeNull();
});

test('upgrade needs money and the full version', () => {
  expect(canUpgrade(1, 100, false)).toBe(false);
  expect(canUpgrade(1, 59, true)).toBe(false);
  expect(canUpgrade(1, 60, true)).toBe(true);
  expect(canUpgrade(MAX_LEVEL, 9999, true)).toBe(false);
});
