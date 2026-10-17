import { SceneId } from '../../game/types';
import { MAX_LEVEL } from '../../game/levels';
import { COUNTER_ORDER, scenesForLevel } from '../../game/navigation';

type Vec3 = [number, number, number];

// All scenes live side by side in one world; the camera glides between them.
export const PANEL_SPACING = 6;

/** Scenes a level doesn't use are parked far away so the pan never passes them. */
const PARKED_X = 1000;

/** Panels are packed left to right over the scenes the level actually serves. */
export function sceneX(scene: SceneId, level: number = MAX_LEVEL): number {
  const i = scenesForLevel(level).indexOf(scene);
  return i === -1 ? PARKED_X + COUNTER_ORDER.indexOf(scene) * PANEL_SPACING : i * PANEL_SPACING;
}

const STATION_POSE = { position: [0, 1.6, 1.8] as Vec3, lookAt: [0, 0, 0] as Vec3 };

const POSES: Record<SceneId, { position: Vec3; lookAt: Vec3 }> = {
  orderBoard: { position: [0, 0, 2.2], lookAt: [0, 0, 0] },
  coffeeStation: STATION_POSE,
  toastStation: STATION_POSE,
  juiceStation: STATION_POSE,
  pancakeStation: STATION_POSE,
  saladStation: STATION_POSE,
  deliveryCounter: { position: [0, 1.3, 2.6], lookAt: [0, 0.55, 0] },
};

/** World-space camera position and look-at target for a scene. */
export function cameraPose(scene: SceneId, level: number = MAX_LEVEL): { position: Vec3; lookAt: Vec3 } {
  const x = sceneX(scene, level);
  const { position, lookAt } = POSES[scene];
  return {
    position: [position[0] + x, position[1], position[2]],
    lookAt: [lookAt[0] + x, lookAt[1], lookAt[2]],
  };
}
