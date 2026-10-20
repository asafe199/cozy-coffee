import { toastTint } from './toastTint';
import { TOAST_MIN_MS, TOAST_BURN_THRESHOLD_MS } from '../../game/review';

test('starts white at zero elapsed and for negative input', () => {
  expect(toastTint(0)).toBe('#ffffff');
  expect(toastTint(-100)).toBe('#ffffff');
});

test('is still light before TOAST_MIN_MS', () => {
  const color = toastTint(TOAST_MIN_MS / 2);
  expect(color).not.toBe('#ffffff');
  // Still much closer to white than to the toasted brown.
  expect(parseInt(color.slice(1, 3), 16)).toBeGreaterThan(0xd0);
});

test('matches the old static toasted color right at the burn threshold', () => {
  expect(toastTint(TOAST_BURN_THRESHOLD_MS)).toBe('#8a5a3a');
});

test('keeps darkening past the burn threshold, then caps', () => {
  const justPastBurn = toastTint(TOAST_BURN_THRESHOLD_MS + 1000);
  const wayPastBurn = toastTint(TOAST_BURN_THRESHOLD_MS + 6000);
  const evenFurther = toastTint(TOAST_BURN_THRESHOLD_MS + 50000);
  expect(parseInt(justPastBurn.slice(1, 3), 16)).toBeGreaterThan(parseInt(wayPastBurn.slice(1, 3), 16));
  expect(wayPastBurn).toBe(evenFurther); // capped
  expect(wayPastBurn).toBe('#2a1810');
});

test('is monotonically non-increasing in brightness (red channel) as time passes', () => {
  const samples = [0, 500, TOAST_MIN_MS, 4000, TOAST_BURN_THRESHOLD_MS, TOAST_BURN_THRESHOLD_MS + 3000, TOAST_BURN_THRESHOLD_MS + 9000];
  const reds = samples.map((ms) => parseInt(toastTint(ms).slice(1, 3), 16));
  for (let i = 1; i < reds.length; i++) {
    expect(reds[i]).toBeLessThanOrEqual(reds[i - 1]);
  }
});
