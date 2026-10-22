import type { ModelData } from '../shared/props/modelData';
import {
  DECOR_CHANDELIER,
  DECOR_LIGHT_CEILING,
  DECOR_MIRROR,
  DECOR_PLANT_BIG,
  DECOR_PLANT_MED,
  DECOR_PLANT_POTTED,
  DECOR_PLANT_SMALL,
  DECOR_SHELF_LARGE,
  DECOR_SHELF_SMALL,
} from '../shared/props/counterDecor.generated';

export interface DecorPiece {
  model: ModelData;
  scale: number;
}

export interface CounterTier {
  /** Amber trim along the top-front edge. */
  trim: boolean;
  /** Dark baseboard along the bottom-front edge. */
  kickplate: boolean;
  /** Small accent blocks at the counter's top corners. */
  cornerAccents: boolean;
  /** Lighter inset panel on the counter face, for the showcase tier. */
  twoTonePanel: boolean;
  plant?: DecorPiece;
  light?: DecorPiece;
  wall?: DecorPiece;
}

// Cumulative: each level keeps the previous level's shape details and adds one
// more, so the counter visibly gets fancier rather than just swapping looks.
// Pilot station (confirmed with the user) — same tier idea as the coffee
// machine, applied to the delivery counter's shape + ambient decor first.
export const COUNTER_TIERS: Record<number, CounterTier> = {
  1: { trim: false, kickplate: false, cornerAccents: false, twoTonePanel: false },
  2: { trim: true, kickplate: false, cornerAccents: false, twoTonePanel: false, plant: { model: DECOR_PLANT_SMALL, scale: 0.18 } },
  3: {
    trim: true,
    kickplate: true,
    cornerAccents: false,
    twoTonePanel: false,
    plant: { model: DECOR_PLANT_MED, scale: 0.25 },
    wall: { model: DECOR_SHELF_SMALL, scale: 0.3 },
  },
  4: {
    trim: true,
    kickplate: true,
    cornerAccents: true,
    twoTonePanel: false,
    plant: { model: DECOR_PLANT_POTTED, scale: 0.28 },
    light: { model: DECOR_LIGHT_CEILING, scale: 0.25 },
    wall: { model: DECOR_SHELF_LARGE, scale: 0.4 },
  },
  5: {
    trim: true,
    kickplate: true,
    cornerAccents: true,
    twoTonePanel: true,
    plant: { model: DECOR_PLANT_BIG, scale: 0.35 },
    light: { model: DECOR_CHANDELIER, scale: 0.4 },
    wall: { model: DECOR_MIRROR, scale: 0.3 },
  },
};

export function counterTier(level: number): CounterTier {
  return COUNTER_TIERS[level] ?? COUNTER_TIERS[1];
}
