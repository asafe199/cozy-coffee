import {
  CALM_INTERVAL_MS,
  MAX_PENDING_ORDERS,
  PEAK_INTERVAL_MS,
  arrivalIntervalMs,
  canEnqueue,
  isPeak,
  takeFromQueue,
} from './queue';
import { ORDERS_PER_SHIFT } from './shift';
import { Order } from './types';

const mk = (id: string): Order => ({ id, items: [{ recipe: 'coffee', wantsSugar: false }] });

test('peak hours have a shorter interval than calm hours', () => {
  expect(isPeak(8 * 60)).toBe(true);
  expect(isPeak(10 * 60)).toBe(false);
  expect(isPeak(14 * 60 + 30)).toBe(true);
  expect(arrivalIntervalMs(9 * 60)).toBe(PEAK_INTERVAL_MS);
  expect(arrivalIntervalMs(12 * 60)).toBe(CALM_INTERVAL_MS);
  expect(PEAK_INTERVAL_MS).toBeLessThan(CALM_INTERVAL_MS);
});

test('canEnqueue respects the pending cap', () => {
  expect(canEnqueue(MAX_PENDING_ORDERS - 1, false, 0)).toBe(true);
  expect(canEnqueue(MAX_PENDING_ORDERS, false, 0)).toBe(false);
});

test('canEnqueue respects the shift order budget', () => {
  expect(canEnqueue(0, false, ORDERS_PER_SHIFT - 1)).toBe(true);
  expect(canEnqueue(0, false, ORDERS_PER_SHIFT)).toBe(false);
  expect(canEnqueue(1, true, ORDERS_PER_SHIFT - 2)).toBe(false);
  expect(canEnqueue(1, false, ORDERS_PER_SHIFT - 2)).toBe(true);
});

test('takeFromQueue picks the oldest by default and a chosen id otherwise', () => {
  const q = [mk('a'), mk('b'), mk('c')];
  expect(takeFromQueue(q)?.order.id).toBe('a');
  const chosen = takeFromQueue(q, 'b');
  expect(chosen?.order.id).toBe('b');
  expect(chosen?.rest.map((o) => o.id)).toEqual(['a', 'c']);
  expect(q).toHaveLength(3);
});

test('takeFromQueue returns null for empty queue or unknown id', () => {
  expect(takeFromQueue([])).toBeNull();
  expect(takeFromQueue([mk('a')], 'zzz')).toBeNull();
});
