export const MAX_SWAY_RAD = 0.35;
export const SWAY_FACTOR = 0.08;

/**
 * Pendulum-like tilt for a dragged object: tilts opposite the direction of
 * horizontal motion, proportional to velocity, clamped to MAX_SWAY_RAD.
 * Framework-agnostic and reusable by any future draggable.
 */
export function computeSwayAngle(velocityX: number): number {
  const angle = -velocityX * SWAY_FACTOR;
  const clamped = Math.max(-MAX_SWAY_RAD, Math.min(MAX_SWAY_RAD, angle));
  return clamped === 0 ? 0 : clamped; // normalize -0 (velocityX === 0) to 0
}
