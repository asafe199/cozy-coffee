import { SceneId } from '../../game/types';

type Vec3 = [number, number, number];

// All four scenes live side by side in one world; the camera glides between them.
export const PANEL_SPACING = 6;

export const SCENE_X: Record<SceneId, number> = {
  orderBoard: 0,
  coffeeStation: PANEL_SPACING,
  toastStation: PANEL_SPACING * 2,
  deliveryCounter: PANEL_SPACING * 3,
};

const POSES: Record<SceneId, { position: Vec3; lookAt: Vec3 }> = {
  orderBoard: { position: [0, 0, 2.2], lookAt: [0, 0, 0] },
  coffeeStation: { position: [0, 1.6, 1.8], lookAt: [0, 0, 0] },
  toastStation: { position: [0, 1.6, 1.8], lookAt: [0, 0, 0] },
  deliveryCounter: { position: [0, 1.3, 2.6], lookAt: [0, 0.55, 0] },
};

/** World-space camera position and look-at target for a scene. */
export function cameraPose(scene: SceneId): { position: Vec3; lookAt: Vec3 } {
  const x = SCENE_X[scene];
  const { position, lookAt } = POSES[scene];
  return {
    position: [position[0] + x, position[1], position[2]],
    lookAt: [lookAt[0] + x, lookAt[1], lookAt[2]],
  };
}
