import { MAX_SWAY_RAD, SWAY_FACTOR, computeSwayAngle } from './dragSway';

test('zero velocity yields zero tilt', () => {
  expect(computeSwayAngle(0)).toBe(0);
});

test('tilt is proportional to velocity and opposes the direction of motion', () => {
  expect(computeSwayAngle(1)).toBeCloseTo(-SWAY_FACTOR, 5);
  expect(computeSwayAngle(-1)).toBeCloseTo(SWAY_FACTOR, 5);
});

test('tilt clamps to MAX_SWAY_RAD at high velocity, in both directions', () => {
  expect(computeSwayAngle(1000)).toBe(-MAX_SWAY_RAD);
  expect(computeSwayAngle(-1000)).toBe(MAX_SWAY_RAD);
});
