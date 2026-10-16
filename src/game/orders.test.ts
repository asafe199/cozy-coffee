import { generateOrder } from './orders';

test('generateOrder returns a coffee order with a unique id', () => {
  const a = generateOrder();
  const b = generateOrder();
  expect(a.recipe).toBe('coffee');
  expect(a.id).not.toBe(b.id);
});

test('generateOrder is deterministic for a given rng', () => {
  const fixedRng = () => 0.1; // < 0.5 → wantsSugar true, per implementation
  const order = generateOrder(fixedRng);
  expect(order.wantsSugar).toBe(true);
});
