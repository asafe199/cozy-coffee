import { Recipe } from './types';

export const MAX_LEVEL = 5;

// Builder-chosen values (spec leaves them open). Index = level - 1.
const UPGRADE_COST = [60, 150, 320, 600]; // cost to go from level N to N+1
const RECIPES: Recipe[][] = [['coffee'], ['coffee', 'toast'], ['coffee', 'toast'], ['coffee', 'toast'], ['coffee', 'toast']];

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
