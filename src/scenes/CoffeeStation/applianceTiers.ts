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
  /** Models authored facing +x need a quarter turn to face the player (and the cup). */
  rotationY?: number;
  /** Shifts the mesh so the machine's body — not its bounding box — centers over the cup. */
  offsetX?: number;
  /** Moves the machine toward/away from MACHINE_ZONE so its spout (not its bounding-box
   * front face) is what the cup actually sits under. Per-model; 0 means "unmoved". */
  offsetZ?: number;
}

// One coffee machine model per cafe level — each a fancier appliance than the
// last (CLAUDE.md "Não yet done" progression). Scales are a first visual
// guess (each model normalizes its own largest dimension to 1, so they don't
// share a common scale) — unverified on-device, same as every other prop in
// this project; expect small adjustments once seen on a real screen.
export const COFFEE_MACHINE_TIERS: Record<number, CoffeeMachineTier> = {
  // Kenney drip machine — the original, already-tuned position (spout reaches
  // forward from the body to MACHINE_ZONE; offsetZ stays 0, don't "fix" this one).
  1: { model: COFFEE_MACHINE, scale: 0.75 },
  2: { model: COFFEE_MACHINE_L2, scale: 0.55 }, // Poly by Google "Espresso Pot" — stovetop moka pot
  // Authored in profile (width 1.0 > depth 0.8): without the turn its spout points
  // sideways and the machine reads as facing away from the cup.
  3: { model: COFFEE_MACHINE_L3, scale: 0.58, rotationY: -Math.PI / 2, offsetZ: 0.11 }, // J-Toastie espresso machine
  // Its body sits 0.127 left of the mesh's bounding-box centre (drip tray juts right).
  4: { model: COFFEE_MACHINE_L4, scale: 0.62, offsetX: 0.08, offsetZ: 0.16 }, // Daqian Dong "Coffee Maker"
  5: { model: COFFEE_MACHINE_L5, scale: 0.64, offsetX: 0.08, offsetZ: 0.16 }, // Same mesh as tier 4, gold reskin
};

export function coffeeMachineTier(level: number): CoffeeMachineTier {
  return COFFEE_MACHINE_TIERS[level] ?? COFFEE_MACHINE_TIERS[1];
}
