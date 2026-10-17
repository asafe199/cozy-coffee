import { cameraPose, sceneX } from './world';

test('camera pose is offset by the scene panel x', () => {
  const pose = cameraPose('toastStation', 2);
  expect(pose.position[0]).toBe(sceneX('toastStation', 2));
  expect(pose.lookAt[0]).toBe(sceneX('toastStation', 2));
  expect(pose.position[1]).toBe(1.6);
});

test('scenes are packed left to right in play order for the level', () => {
  expect(sceneX('orderBoard', 2)).toBeLessThan(sceneX('coffeeStation', 2));
  expect(sceneX('coffeeStation', 2)).toBeLessThan(sceneX('toastStation', 2));
  expect(sceneX('toastStation', 2)).toBeLessThan(sceneX('deliveryCounter', 2));
});

test('delivery sits right after the last station, so low levels never pan far', () => {
  expect(sceneX('deliveryCounter', 1)).toBe(sceneX('coffeeStation', 1) + 6);
  expect(sceneX('deliveryCounter', 5)).toBe(sceneX('saladStation', 5) + 6);
});

test('stations a level does not serve are parked far away', () => {
  expect(sceneX('saladStation', 1)).toBeGreaterThan(500);
});
