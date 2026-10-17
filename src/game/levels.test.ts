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

import { levelConfig, clampLevel } from './levels';

test('every level has a config and orders grow with level', () => {
  for (let l = 1; l <= MAX_LEVEL; l++) expect(levelConfig(l).ordersPerShift).toBeGreaterThan(0);
  expect(levelConfig(5).ordersPerShift).toBeGreaterThan(levelConfig(1).ordersPerShift);
  expect(levelConfig(5).priceMultiplier).toBeGreaterThan(levelConfig(1).priceMultiplier);
  expect(clampLevel(99)).toBe(MAX_LEVEL);
  expect(clampLevel(0)).toBe(1);
});

test('tables grow with the level', () => {
  for (let l = 2; l <= MAX_LEVEL; l++) {
    expect(levelConfig(l).tableScale).toBeGreaterThan(levelConfig(l - 1).tableScale);
  }
});
