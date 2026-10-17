export type ShiftId = 'morning' | 'afternoon';

export interface Clock {
  shift: ShiftId;
  /** Minutes since midnight of in-game time. */
  minutes: number;
  ordersServed: number;
}

// Design doc (2026-10-16-cozy-cafe-design.md, Review Focus): "um turno tem
// no máximo ~10 pedidos no total" — was 4 in the Copilot-added version.
export const ORDERS_PER_SHIFT = 10;
export const MINUTES_PER_ORDER = 15;
export const SHIFT_START: Record<ShiftId, number> = { morning: 8 * 60, afternoon: 14 * 60 };

export function initialClock(): Clock {
  return { shift: 'morning', minutes: SHIFT_START.morning, ordersServed: 0 };
}

/**
 * Event-driven clock: serving an order advances time a little; finishing a
 * shift's orders jumps straight to the next shift (no dead waiting), and
 * finishing the afternoon ends the day.
 */
export function advanceClock(
  clock: Clock,
  ordersPerShift: number = ORDERS_PER_SHIFT,
): { clock: Clock; dayEnded: boolean } {
  const ordersServed = clock.ordersServed + 1;
  if (ordersServed < ordersPerShift) {
    return {
      clock: { ...clock, ordersServed, minutes: clock.minutes + MINUTES_PER_ORDER },
      dayEnded: false,
    };
  }
  if (clock.shift === 'morning') {
    return {
      clock: { shift: 'afternoon', minutes: SHIFT_START.afternoon, ordersServed: 0 },
      dayEnded: false,
    };
  }
  return { clock: { ...clock, ordersServed }, dayEnded: true };
}

export function formatClock(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}
