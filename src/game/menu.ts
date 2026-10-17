import { Order, Recipe } from './types';

// Prices are purely cosmetic (spec: "Progressão"): they never affect demand or reviews.
export const ITEM_PRICES: Record<Recipe, number> = { coffee: 3, toast: 2, juice: 4, pancakes: 5, salad: 6 };

export function orderValue(order: Order, multiplier = 1): number {
  return Math.round(order.items.reduce((sum, item) => sum + ITEM_PRICES[item.recipe], 0) * multiplier);
}
