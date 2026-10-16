import { resolveDropZone } from '../CoffeeStation/dropZones';
import { BUTTER_ZONE, GRIDDLE_ZONE } from './zones';

const zones = [GRIDDLE_ZONE, BUTTER_ZONE];

test('dropping bread on the griddle resolves the griddle zone', () => {
  expect(resolveDropZone({ x: GRIDDLE_ZONE.x, z: GRIDDLE_ZONE.z }, zones)).toBe(GRIDDLE_ZONE);
});

test('dropping bread on the butter resolves the butter zone', () => {
  expect(resolveDropZone({ x: BUTTER_ZONE.x + 0.1, z: BUTTER_ZONE.z }, zones)).toBe(BUTTER_ZONE);
});

test('dropping bread away from every zone resolves to null (snap back)', () => {
  expect(resolveDropZone({ x: 0, z: -1 }, zones)).toBeNull();
});

test('the toast zones do not overlap each other', () => {
  const dx = GRIDDLE_ZONE.x - BUTTER_ZONE.x;
  const dz = GRIDDLE_ZONE.z - BUTTER_ZONE.z;
  expect(Math.sqrt(dx * dx + dz * dz)).toBeGreaterThan(GRIDDLE_ZONE.radius + BUTTER_ZONE.radius);
});
