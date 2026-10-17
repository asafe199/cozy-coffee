import { cameraPose, SCENE_X } from './world';

test('camera pose is offset by the scene panel x', () => {
  const pose = cameraPose('toastStation');
  expect(pose.position[0]).toBe(SCENE_X.toastStation);
  expect(pose.lookAt[0]).toBe(SCENE_X.toastStation);
  expect(pose.position[1]).toBe(1.6);
});

test('scenes are laid out left to right in play order', () => {
  expect(SCENE_X.orderBoard).toBeLessThan(SCENE_X.coffeeStation);
  expect(SCENE_X.coffeeStation).toBeLessThan(SCENE_X.toastStation);
  expect(SCENE_X.toastStation).toBeLessThan(SCENE_X.deliveryCounter);
});
