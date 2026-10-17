import { SceneId } from './types';

// Left-to-right layout of the counters the player can slide between.
export const COUNTER_ORDER: SceneId[] = ['orderBoard', 'coffeeStation', 'toastStation', 'deliveryCounter'];

/** Scene one step left (-1) or right (+1) of `scene`, or null at the edges / off the counters. */
export function neighborScene(scene: SceneId, dir: -1 | 1): SceneId | null {
  const i = COUNTER_ORDER.indexOf(scene);
  if (i === -1) return null;
  return COUNTER_ORDER[i + dir] ?? null;
}
