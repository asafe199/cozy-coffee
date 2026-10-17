import { Recipe, SceneId } from './types';
import { MAX_LEVEL, recipesForLevel } from './levels';

// Left-to-right layout of every counter; stations a level doesn't serve are skipped.
export const COUNTER_ORDER: SceneId[] = [
  'orderBoard',
  'coffeeStation',
  'toastStation',
  'juiceStation',
  'pancakeStation',
  'saladStation',
  'deliveryCounter',
];

const STATION_RECIPE: Partial<Record<SceneId, Recipe>> = {
  coffeeStation: 'coffee',
  toastStation: 'toast',
  juiceStation: 'juice',
  pancakeStation: 'pancakes',
  saladStation: 'salad',
};

/** The counters available at a cafe level, in left-to-right order. */
export function scenesForLevel(level: number = MAX_LEVEL): SceneId[] {
  const recipes = recipesForLevel(level);
  return COUNTER_ORDER.filter((scene) => {
    const recipe = STATION_RECIPE[scene];
    return recipe === undefined || recipes.includes(recipe);
  });
}

/** Scene one step left (-1) or right (+1) of `scene`, or null at the edges / off the counters. */
export function neighborScene(scene: SceneId, dir: -1 | 1, level: number = MAX_LEVEL): SceneId | null {
  const order = scenesForLevel(level);
  const i = order.indexOf(scene);
  if (i === -1) return null;
  return order[i + dir] ?? null;
}
