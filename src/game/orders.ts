import { Order, OrderItem, Recipe, SceneId, JuiceFlavor } from './types';
import { levelConfig, recipesForLevel } from './levels';
import { JUICE_FLAVOR_IDS } from '../scenes/JuiceStation/flavors';

const STATION: Record<Recipe, SceneId> = {
  coffee: 'coffeeStation',
  toast: 'toastStation',
  juice: 'juiceStation',
  pancakes: 'pancakeStation',
  salad: 'saladStation',
};

export function stationForItem(item: OrderItem): SceneId {
  return STATION[item.recipe];
}

export function itemWantsExtra(item: OrderItem): boolean {
  switch (item.recipe) {
    case 'coffee':
      return item.wantsSugar;
    case 'toast':
      return item.wantsButter;
    default:
      return item.wantsExtra;
  }
}

function makeItem(recipe: Recipe, rng: () => number): OrderItem {
  const extra = rng() < 0.5;
  if (recipe === 'coffee') return { recipe, wantsSugar: extra };
  if (recipe === 'toast') return { recipe, wantsButter: extra };
  if (recipe === 'juice') {
    const flavor = JUICE_FLAVOR_IDS[Math.floor(rng() * JUICE_FLAVOR_IDS.length)];
    return { recipe, flavor, wantsExtra: extra };
  }
  return { recipe, wantsExtra: extra };
}

export function generateOrder(rng: () => number = Math.random, level = 1): Order {
  const recipes = recipesForLevel(level);
  const { maxItemsPerOrder } = levelConfig(level);
  const count = Math.min(maxItemsPerOrder, recipes.length > 1 ? 1 + Math.floor(rng() * maxItemsPerOrder) : 1);
  const items: OrderItem[] = [];
  for (let i = 0; i < count; i++) {
    // The first item is always coffee; later ones draw from the level's recipes.
    items.push(makeItem(i === 0 ? 'coffee' : recipes[Math.floor(rng() * recipes.length)], rng));
  }
  return { id: `order-${Date.now()}-${Math.floor(rng() * 1e6)}`, items };
}

export interface OrderWords {
  names: Record<Recipe, string>;
  /** Suffix appended when the item has its extra (sugar, butter, ice, honey, dressing). */
  extras: Record<Recipe, string>;
  /** Juice items are named by their specific flavor, not the generic "Juice". */
  juiceFlavorNames: Record<JuiceFlavor, string>;
}

const EN_WORDS: OrderWords = {
  names: { coffee: 'Coffee', toast: 'Toast', juice: 'Juice', pancakes: 'Pancakes', salad: 'Salad' },
  extras: {
    coffee: ' with sugar',
    toast: ' with butter',
    juice: ' with ice',
    pancakes: ' with honey',
    salad: ' with dressing',
  },
  juiceFlavorNames: {
    orange: 'Orange Juice',
    lemonade: 'Lemonade',
    watermelon: 'Watermelon Juice',
    mango: 'Mango Juice',
    pineapple: 'Pineapple Juice',
    strawberryBanana: 'Strawberry Banana Smoothie',
    mangoPineapple: 'Mango Pineapple Juice',
    milkshakeChocolate: 'Chocolate Milkshake',
    milkshakeStrawberry: 'Strawberry Milkshake',
    milkshakeVanilla: 'Vanilla Milkshake',
  },
};

function itemName(item: OrderItem, w: OrderWords): string {
  if (item.recipe === 'juice') {
    return w.juiceFlavorNames[item.flavor];
  }
  return w.names[item.recipe];
}

export function describeOrder(order: Order, w: OrderWords = EN_WORDS): string {
  return order.items.map((item) => `${itemName(item, w)}${itemWantsExtra(item) ? w.extras[item.recipe] : ''}`).join(' + ');
}
