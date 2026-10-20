import type { ModelData } from '../shared/props/modelData';
import { COFFEE_MACHINE } from '../shared/props/models.generated';
import {
  COFFEE_MACHINE_L2,
  COFFEE_MACHINE_L3,
  COFFEE_MACHINE_L4,
  COFFEE_MACHINE_L5,
} from '../shared/props/coffeeMachineTiers.generated';

export interface CoffeeMachineTier {
  model: ModelData;
  scale: number;
}

// One coffee machine model per cafe level — each a fancier appliance than the
// last (CLAUDE.md "Não yet done" progression). Scales are a first visual
// guess (each model normalizes its own largest dimension to 1, so they don't
// share a common scale) — unverified on-device, same as every other prop in
// this project; expect small adjustments once seen on a real screen.
export const COFFEE_MACHINE_TIERS: Record<number, CoffeeMachineTier> = {
  1: { model: COFFEE_MACHINE, scale: 0.75 }, // Kenney drip machine (unchanged)
  2: { model: COFFEE_MACHINE_L2, scale: 0.55 }, // Poly by Google "Espresso Pot" — stovetop moka pot
  3: { model: COFFEE_MACHINE_L3, scale: 0.58 }, // J-Toastie "Coffee Machine" — compact espresso machine w/ portafilter
  4: { model: COFFEE_MACHINE_L4, scale: 0.62 }, // Daqian Dong "Coffee Maker" — larger espresso machine
  5: { model: COFFEE_MACHINE_L5, scale: 0.64 }, // Same mesh as tier 4, reskinned gold/brass for the showcase cafe
};

export function coffeeMachineTier(level: number): CoffeeMachineTier {
  return COFFEE_MACHINE_TIERS[level] ?? COFFEE_MACHINE_TIERS[1];
}
