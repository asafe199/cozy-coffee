import { neighborScene, scenesForLevel } from './navigation';

test('slides between counters left to right', () => {
  expect(neighborScene('coffeeStation', 1, 2)).toBe('toastStation');
  expect(neighborScene('toastStation', 1, 2)).toBe('deliveryCounter');
  expect(neighborScene('deliveryCounter', -1, 2)).toBe('toastStation');
});

test('the order board is the leftmost stop', () => {
  expect(neighborScene('orderBoard', 1, 1)).toBe('coffeeStation');
  expect(neighborScene('coffeeStation', -1, 1)).toBe('orderBoard');
});

test('returns null at the edges and off the counters', () => {
  expect(neighborScene('deliveryCounter', 1, 3)).toBeNull();
  expect(neighborScene('orderBoard', -1, 3)).toBeNull();
  expect(neighborScene('saladStation', 1, 1)).toBeNull();
});

test('stations unlock with the level', () => {
  expect(scenesForLevel(1)).toEqual(['orderBoard', 'coffeeStation', 'deliveryCounter']);
  expect(scenesForLevel(3)).toContain('juiceStation');
  expect(scenesForLevel(3)).not.toContain('pancakeStation');
  expect(scenesForLevel(5)).toEqual([
    'orderBoard', 'coffeeStation', 'toastStation', 'juiceStation', 'pancakeStation', 'saladStation', 'deliveryCounter',
  ]);
});
