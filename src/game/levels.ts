import { Recipe } from './types';

export const MAX_LEVEL = 5;

// Builder-chosen values (spec leaves them open). Index = level - 1.
const UPGRADE_COST = [60, 150, 320, 600]; // cost to go from level N to N+1
const RECIPES: Recipe[][] = [
  ['coffee'],
  ['coffee', 'toast'],
  ['coffee', 'toast', 'juice'],
  ['coffee', 'toast', 'juice', 'pancakes'],
  ['coffee', 'toast', 'juice', 'pancakes', 'salad'],
];

export interface LevelTheme {
  background: string;
  skyLight: number;
  sunLight: number;
}

export interface LevelConfig {
  maxItemsPerOrder: number;
  priceMultiplier: number;
  /** Table/counter footprint multiplier: fancier cafes have bigger tables. */
  tableScale: number;
  /** Table top color: plain wood at level 1 up to polished walnut. */
  tableColor: string;
  theme: LevelTheme;
}

// Bigger shops serve bigger orders, but pacing stays calm (no timers). How many
// orders make up a shift is no longer level-based — see randomOrdersPerShift (shift.ts).
const CONFIGS: LevelConfig[] = [
  { maxItemsPerOrder: 1, priceMultiplier: 1, tableScale: 1, tableColor: '#6B4226', theme: { background: '#2B2729', skyLight: 0xfff1d6, sunLight: 0xffdca0 } },
  { maxItemsPerOrder: 2, priceMultiplier: 1.2, tableScale: 1.1, tableColor: '#69402A', theme: { background: '#2E2927', skyLight: 0xffeccb, sunLight: 0xffd592 } },
  { maxItemsPerOrder: 2, priceMultiplier: 1.45, tableScale: 1.2, tableColor: '#5C3A25', theme: { background: '#2A2B2E', skyLight: 0xf4efe0, sunLight: 0xffe3b0 } },
  { maxItemsPerOrder: 3, priceMultiplier: 1.75, tableScale: 1.3, tableColor: '#4F3222', theme: { background: '#272A30', skyLight: 0xe8ecf5, sunLight: 0xffe8c4 } },
  { maxItemsPerOrder: 3, priceMultiplier: 2.1, tableScale: 1.4, tableColor: '#432A1D', theme: { background: '#24232B', skyLight: 0xe2dcf5, sunLight: 0xfff0d6 } },
];

export function clampLevel(level: number): number {
  return Math.min(Math.max(Math.trunc(level) || 1, 1), MAX_LEVEL);
}

export function levelConfig(level: number): LevelConfig {
  return CONFIGS[clampLevel(level) - 1];
}

/** Placeholder until the IAP exists: every level is playable. */
export const FULL_VERSION_UNLOCKED = true;

export function upgradeCost(level: number): number | null {
  return level >= MAX_LEVEL ? null : UPGRADE_COST[level - 1];
}

export function recipesForLevel(level: number): Recipe[] {
  return RECIPES[Math.min(Math.max(level, 1), MAX_LEVEL) - 1];
}

/** Levels 2-5 require the one-time full-version purchase (spec: Paywall). */
export function canUpgrade(level: number, money: number, fullVersion: boolean): boolean {
  const cost = upgradeCost(level);
  return cost !== null && money >= cost && fullVersion;
}
