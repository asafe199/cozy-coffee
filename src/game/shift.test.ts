import { Clock, advanceClock, formatClock, initialClock, ORDERS_PER_SHIFT, SHIFT_START } from './shift';

const afternoonStart = (): Clock => ({ shift: 'afternoon', minutes: SHIFT_START.afternoon, ordersServed: 0 });

test('initial clock starts the morning shift at 08:00', () => {
  const c = initialClock();
  expect(c.shift).toBe('morning');
  expect(formatClock(c.minutes)).toBe('08:00');
  expect(c.ordersServed).toBe(0);
});

test('each served order advances the clock within the shift', () => {
  const { clock, dayEnded } = advanceClock(initialClock());
  expect(clock.ordersServed).toBe(1);
  expect(clock.minutes).toBeGreaterThan(SHIFT_START.morning);
  expect(dayEnded).toBe(false);
});

test('finishing the morning orders jumps the clock to the afternoon shift', () => {
  let clock = initialClock();
  for (let i = 0; i < ORDERS_PER_SHIFT; i++) {
    clock = advanceClock(clock).clock;
  }
  expect(clock.shift).toBe('afternoon');
  expect(clock.minutes).toBe(SHIFT_START.afternoon);
  expect(clock.ordersServed).toBe(0);
});

test('finishing the afternoon orders ends the day', () => {
  let clock = afternoonStart();
  let dayEnded = false;
  for (let i = 0; i < ORDERS_PER_SHIFT; i++) {
    ({ clock, dayEnded } = advanceClock(clock));
  }
  expect(dayEnded).toBe(true);
});

test('only the last order of the afternoon ends the day', () => {
  let clock = afternoonStart();
  for (let i = 0; i < ORDERS_PER_SHIFT - 1; i++) {
    const result = advanceClock(clock);
    expect(result.dayEnded).toBe(false);
    clock = result.clock;
  }
});

test('formatClock pads hours and minutes', () => {
  expect(formatClock(8 * 60 + 5)).toBe('08:05');
  expect(formatClock(14 * 60)).toBe('14:00');
});
