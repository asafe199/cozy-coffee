import { neighborScene } from './navigation';

test('slides between counters left to right', () => {
  expect(neighborScene('coffeeStation', 1)).toBe('toastStation');
  expect(neighborScene('toastStation', 1)).toBe('deliveryCounter');
  expect(neighborScene('deliveryCounter', -1)).toBe('toastStation');
});

test('returns null at the edges and off the counters', () => {
  expect(neighborScene('coffeeStation', -1)).toBeNull();
  expect(neighborScene('deliveryCounter', 1)).toBeNull();
  expect(neighborScene('orderBoard', 1)).toBeNull();
});
