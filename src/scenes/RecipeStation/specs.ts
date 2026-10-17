import type { ExtraRecipe, SceneId } from '../../game/types';
import type { ModelData } from '../shared/props/modelData';
import type { Zone } from '../CoffeeStation/dropZones';
import {
  BLENDER,
  BOWL,
  CUTTING_BOARD,
  FRYING_PAN,
  GLASS,
  HONEY,
  OIL,
  PANCAKES,
  PLATE,
  SALAD,
} from '../shared/props/models.generated';

export type ExtraKind = 'ice' | 'honey' | 'dressing';

export interface RecipeSpec {
  recipe: ExtraRecipe;
  scene: SceneId;
  extraKind: ExtraKind;
  appliance: { model: ModelData; scale: number; z: number; offsetY?: number };
  // The draggable swaps from `before` to `after` once the appliance has run.
  item: { before: ModelData; after: ModelData; scale: number; tintAfter?: string };
  // Static prop the player drags the item to for the optional extra.
  extraProp: { model?: ModelData; scale: number };
  applianceZone: Zone;
  extraZone: Zone;
  // Juice shows a liquid rising in the glass.
  liquidColor?: string;
}

// Same tabletop layout as the coffee/toast stations: item starts at the origin,
// appliance to the left, optional extra to the right.
const APPLIANCE_X = -0.6;
const EXTRA_X = 0.6;

export const SPECS: Record<ExtraRecipe, RecipeSpec> = {
  juice: {
    recipe: 'juice',
    scene: 'juiceStation',
    extraKind: 'ice',
    appliance: { model: BLENDER, scale: 0.9, z: -0.15 },
    item: { before: GLASS, after: GLASS, scale: 0.3 },
    extraProp: { scale: 1 },
    applianceZone: { id: 'appliance', x: APPLIANCE_X, z: 0.3, radius: 0.4 },
    extraZone: { id: 'extra', x: EXTRA_X, z: 0, radius: 0.35 },
    liquidColor: '#F2A33A',
  },
  pancakes: {
    recipe: 'pancakes',
    scene: 'pancakeStation',
    extraKind: 'honey',
    appliance: { model: FRYING_PAN, scale: 0.9, z: 0 },
    item: { before: PLATE, after: PANCAKES, scale: 0.4, tintAfter: '#e0a860' },
    extraProp: { model: HONEY, scale: 0.28 },
    applianceZone: { id: 'appliance', x: APPLIANCE_X, z: 0.05, radius: 0.4, y: 0.06 },
    extraZone: { id: 'extra', x: EXTRA_X, z: 0, radius: 0.35 },
  },
  salad: {
    recipe: 'salad',
    scene: 'saladStation',
    extraKind: 'dressing',
    appliance: { model: CUTTING_BOARD, scale: 0.9, z: 0.1 },
    item: { before: BOWL, after: SALAD, scale: 0.4 },
    extraProp: { model: OIL, scale: 0.35 },
    applianceZone: { id: 'appliance', x: APPLIANCE_X, z: 0.1, radius: 0.4, y: 0.04 },
    extraZone: { id: 'extra', x: EXTRA_X, z: 0, radius: 0.35 },
  },
};

export const EXTRA_RECIPES: ExtraRecipe[] = ['juice', 'pancakes', 'salad'];
