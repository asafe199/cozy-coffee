import { describeOrder, generateOrder, stationForItem } from './orders';

test('level 1 only ever asks for a single coffee', () => {
  for (const r of [0.1, 0.5, 0.9]) {
    expect(generateOrder(() => r, 1).items.map((i) => i.recipe)).toEqual(['coffee']);
  }
});

test('level 4 can ask for three items', () => {
  expect(generateOrder(() => 0.99, 4).items).toHaveLength(3);
});

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
  const order = generateOrder(() => 0.9, 2);
  expect(order.items).toEqual([
    { recipe: 'coffee', wantsSugar: false },
    { recipe: 'toast', wantsButter: false },
  ]);
});

test('describeOrder lists items with their options', () => {
  expect(
    describeOrder({
      id: 'x',
      items: [
        { recipe: 'coffee', wantsSugar: true },
        { recipe: 'toast', wantsButter: false },
      ],
    }),
  ).toBe('Coffee with sugar + Toast');
});

test('level 5 orders can include every recipe and route to their stations', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 400; i++) {
    for (const item of generateOrder(Math.random, 5).items) seen.add(item.recipe);
  }
  expect([...seen].sort()).toEqual(['coffee', 'juice', 'pancakes', 'salad', 'toast']);
  expect(stationForItem({ recipe: 'salad', wantsExtra: true })).toBe('saladStation');
});

test('describeOrder names the extras', () => {
  expect(describeOrder({ id: 'x', items: [{ recipe: 'pancakes', wantsExtra: true }] })).toBe('Pancakes with honey');
});
