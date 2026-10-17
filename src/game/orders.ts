import { Order, OrderItem, Recipe, SceneId } from './types';
import { levelConfig, recipesForLevel } from './levels';

export function stationForItem(item: OrderItem): SceneId {
  return item.recipe === 'coffee' ? 'coffeeStation' : 'toastStation';
}

function makeItem(recipe: Recipe, rng: () => number): OrderItem {
  return recipe === 'coffee'
    ? { recipe: 'coffee', wantsSugar: rng() < 0.5 }
    : { recipe: 'toast', wantsButter: rng() < 0.5 };
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

export type OrderWords = { coffee: string; toast: string; withSugar: string; withButter: string };

const EN_WORDS: OrderWords = {
  coffee: 'Coffee',
  toast: 'Toast',
  withSugar: ' with sugar',
  withButter: ' with butter',
};

export function describeOrder(order: Order, w: OrderWords = EN_WORDS): string {
  return order.items
    .map((item) =>
      item.recipe === 'coffee'
        ? `${w.coffee}${item.wantsSugar ? w.withSugar : ''}`
        : `${w.toast}${item.wantsButter ? w.withButter : ''}`,
    )
    .join(' + ');
}
