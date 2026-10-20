import { TOAST_MIN_MS, TOAST_BURN_THRESHOLD_MS } from '../../game/review';

type RGB = [number, number, number];

const RAW: RGB = [0xff, 0xff, 0xff]; // untouched bread
const GOLDEN: RGB = [0xd9, 0xa0, 0x52]; // just entering the "good" window
const TOASTED: RGB = [0x8a, 0x5a, 0x3a]; // right at the burn threshold (was the old static "toasting" color)
const BURNT: RGB = [0x2a, 0x18, 0x10]; // fully burnt

// How long past TOAST_BURN_THRESHOLD_MS the color keeps darkening before it
// caps at BURNT. Purely a visual pace, not judged by review.ts.
const BURN_DARKEN_MS = 6000;

// Piecewise-linear color stops in elapsed-ms order; kept in sync with the
// same thresholds review.ts scores doneness by, so the visual always agrees
// with the judgment (light = raw, golden/brown = good, near-black = burnt).
const STOPS: [number, RGB][] = [
  [0, RAW],
  [TOAST_MIN_MS, GOLDEN],
  [TOAST_BURN_THRESHOLD_MS, TOASTED],
  [TOAST_BURN_THRESHOLD_MS + BURN_DARKEN_MS, BURNT],
];

function mix(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function toHex([r, g, b]: RGB): string {
  const h = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Bread tint for a given elapsed toasting time (ms); continuous, no snap. */
export function toastTint(elapsedMs: number): string {
  const e = Math.max(0, elapsedMs);
  if (e <= STOPS[0][0]) {
    return toHex(STOPS[0][1]);
  }
  for (let i = 1; i < STOPS.length; i++) {
    const [ms, color] = STOPS[i];
    if (e <= ms) {
      const [prevMs, prevColor] = STOPS[i - 1];
      const t = (e - prevMs) / (ms - prevMs);
      return toHex(mix(prevColor, color, t));
    }
  }
  return toHex(STOPS[STOPS.length - 1][1]);
}
