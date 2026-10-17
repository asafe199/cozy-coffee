import { Order } from './types';
import { ORDERS_PER_SHIFT } from './shift';

/** At most this many orders wait on the board at once, so it never feels like an avalanche. */
export const MAX_PENDING_ORDERS = 3;

const PEAK_WINDOWS: ReadonlyArray<readonly [number, number]> = [
  [8 * 60, 10 * 60],
  [14 * 60, 16 * 60],
];

export const PEAK_INTERVAL_MS = 25_000;
export const CALM_INTERVAL_MS = 45_000;

export function isPeak(minutes: number): boolean {
  return PEAK_WINDOWS.some(([start, end]) => minutes >= start && minutes < end);
}

/** Real-time gap before the next customer arrives: shorter at peak, calmer otherwise. */
export function arrivalIntervalMs(minutes: number): number {
  return isPeak(minutes) ? PEAK_INTERVAL_MS : CALM_INTERVAL_MS;
}

/**
 * A new order may arrive only while the board has room and the shift's order
 * budget isn't already spoken for by served + waiting + in-flight orders.
 */
export function canEnqueue(
  queueLength: number,
  hasCurrent: boolean,
  ordersServed: number,
  ordersPerShift: number = ORDERS_PER_SHIFT,
): boolean {
  return (
    queueLength < MAX_PENDING_ORDERS &&
    ordersServed + queueLength + (hasCurrent ? 1 : 0) < ordersPerShift
  );
}

/** Removes the chosen order (or the oldest when no id is given). Returns null if the queue is empty or the id is unknown. */
export function takeFromQueue(
  queue: Order[],
  orderId?: string,
): { order: Order; rest: Order[] } | null {
  const index = orderId === undefined ? 0 : queue.findIndex((o) => o.id === orderId);
  if (index < 0 || index >= queue.length) {
    return null;
  }
  return { order: queue[index], rest: queue.filter((_, i) => i !== index) };
}
