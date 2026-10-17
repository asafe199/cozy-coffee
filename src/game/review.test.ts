import { calculateReview } from './review';
import { Order, ItemPrep } from './types';

const coffeeOrder: Order = { id: '1', items: [{ recipe: 'coffee', wantsSugar: true }] };
const comboOrder: Order = {
  id: '2',
  items: [
    { recipe: 'coffee', wantsSugar: true },
    { recipe: 'toast', wantsButter: true },
  ],
};

const goodCoffee: ItemPrep = { recipe: 'coffee', sugarAdded: true, prepTimeMs: 1000 };
const goodToast: ItemPrep = { recipe: 'toast', butterAdded: true, toastedMs: 3000 };

test('never-prepared delivery (no preps) is worst-case, not a crash', () => {
  const result = calculateReview(coffeeOrder, []);
  expect(result.stars).toBe(1);
  expect(result.comments).toContain('order_never_prepared');
});

test('null prep entries are treated as never prepared', () => {
  const result = calculateReview(coffeeOrder, [null]);
  expect(result.stars).toBe(1);
  expect(result.comments).toContain('order_never_prepared');
});

test('perfect coffee yields 5 stars with no comments', () => {
  const result = calculateReview(coffeeOrder, [goodCoffee]);
  expect(result.stars).toBe(5);
  expect(result.comments).toHaveLength(0);
});

test('missing requested sugar lowers stars and adds a comment', () => {
  const result = calculateReview(coffeeOrder, [{ ...goodCoffee, sugarAdded: false } as ItemPrep]);
  expect(result.stars).toBe(4);
  expect(result.comments).toContain('missing_sugar');
});

test('coffee prep over the threshold lowers stars and adds a comment', () => {
  const result = calculateReview(coffeeOrder, [{ ...goodCoffee, prepTimeMs: 9000 } as ItemPrep]);
  expect(result.stars).toBe(4);
  expect(result.comments).toContain('too_slow');
});

test('perfect two-item order yields 5 stars', () => {
  const result = calculateReview(comboOrder, [goodCoffee, goodToast]);
  expect(result.stars).toBe(5);
});

test('missing butter lowers stars', () => {
  const result = calculateReview(comboOrder, [goodCoffee, { ...goodToast, butterAdded: false } as ItemPrep]);
  expect(result.stars).toBe(4);
  expect(result.comments).toContain('missing_butter');
});

test('burned toast lowers stars', () => {
  const result = calculateReview(comboOrder, [goodCoffee, { ...goodToast, toastedMs: 20000 } as ItemPrep]);
  expect(result.stars).toBe(4);
  expect(result.comments).toContain('burned_toast');
});

test('untoasted bread (never toasted) lowers stars', () => {
  const result = calculateReview(comboOrder, [goodCoffee, { ...goodToast, toastedMs: 0 } as ItemPrep]);
  expect(result.comments).toContain('untoasted_bread');
  expect(result.stars).toBe(4);
});

test('a skipped second item is penalized but the first still counts', () => {
  const result = calculateReview(comboOrder, [goodCoffee]);
  expect(result.comments).toContain('order_never_prepared');
  expect(result.stars).toBeLessThan(5);
});

test('stars never drop below 1 even with every rule failing', () => {
  const result = calculateReview(comboOrder, [
    { recipe: 'coffee', sugarAdded: false, prepTimeMs: 20000 },
    { recipe: 'toast', butterAdded: false, toastedMs: 20000 },
  ]);
  expect(result.stars).toBeGreaterThanOrEqual(1);
});

test('a mismatched prep type is treated as never prepared', () => {
  const result = calculateReview(comboOrder, [goodToast, goodCoffee]);
  expect(result.comments).toContain('order_never_prepared');
});

test('juice without the requested ice loses a star', () => {
  const order = { id: 'j', items: [{ recipe: 'juice' as const, wantsExtra: true }] };
  expect(calculateReview(order, [{ recipe: 'juice', extraAdded: true, processMs: 2000 }]).stars).toBe(5);
  const r = calculateReview(order, [{ recipe: 'juice', extraAdded: false, processMs: 2000 }]);
  expect(r.stars).toBe(4);
  expect(r.comments).toContain('missing_ice');
});

test('pancakes can be raw or burned, juice and salad have no timing', () => {
  const pancakes = { id: 'p', items: [{ recipe: 'pancakes' as const, wantsExtra: false }] };
  expect(calculateReview(pancakes, [{ recipe: 'pancakes', extraAdded: false, processMs: 100 }]).comments).toContain('raw_pancakes');
  expect(calculateReview(pancakes, [{ recipe: 'pancakes', extraAdded: false, processMs: 20000 }]).comments).toContain('burned_pancakes');
  const salad = { id: 's', items: [{ recipe: 'salad' as const, wantsExtra: false }] };
  expect(calculateReview(salad, [{ recipe: 'salad', extraAdded: false, processMs: 20000 }]).stars).toBe(5);
});
