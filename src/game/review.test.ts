import { calculateReview } from './review';
import { Order } from './types';

const order: Order = { id: '1', recipe: 'coffee', wantsSugar: true };

test('never-prepared delivery (prep is null) is worst-case, not a crash', () => {
  const result = calculateReview(order, null);
  expect(result.stars).toBe(1);
  expect(result.comments).toContain('order_never_prepared');
});

test('perfect prep within time, correct sugar, yields 5 stars with no comments', () => {
  const result = calculateReview(order, { sugarAdded: true, prepTimeMs: 1000 });
  expect(result.stars).toBe(5);
  expect(result.comments).toHaveLength(0);
});

test('missing requested sugar lowers stars and adds a comment', () => {
  const result = calculateReview(order, { sugarAdded: false, prepTimeMs: 1000 });
  expect(result.stars).toBe(4);
  expect(result.comments).toContain('missing_sugar');
});

test('prep time over the threshold lowers stars and adds a comment', () => {
  const result = calculateReview(order, { sugarAdded: true, prepTimeMs: 9000 });
  expect(result.stars).toBe(4);
  expect(result.comments).toContain('too_slow');
});

test('stars never drop below 1 even with every rule failing', () => {
  const result = calculateReview(order, { sugarAdded: false, prepTimeMs: 20000 });
  expect(result.stars).toBeGreaterThanOrEqual(1);
});
