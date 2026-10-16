import { generateOrder } from './orders';

test('generateOrder returns 1-2 items and a unique id', () => {
  const a = generateOrder();
  const b = generateOrder();
  expect(a.items.length).toBeGreaterThanOrEqual(1);
  expect(a.items.length).toBeLessThanOrEqual(2);
  expect(a.id).not.toBe(b.id);
});

test('generateOrder is deterministic for a given rng', () => {
  const order = generateOrder(() => 0.1);
  expect(order.items).toEqual([{ recipe: 'coffee', wantsSugar: true }]);
});

test('a high rng yields a two-item order ending with toast', () => {
  const order = generateOrder(() => 0.9);
  expect(order.items).toEqual([
    { recipe: 'coffee', wantsSugar: false },
    { recipe: 'toast', wantsButter: false },
  ]);
});
