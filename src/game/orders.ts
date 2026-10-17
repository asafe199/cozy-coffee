import { Order, OrderItem, SceneId } from './types';

export function stationForItem(item: OrderItem): SceneId {
  return item.recipe === 'coffee' ? 'coffeeStation' : 'toastStation';
}

export function generateOrder(rng: () => number = Math.random): Order {
  const twoItems = rng() >= 0.5;
  const items: OrderItem[] = [{ recipe: 'coffee', wantsSugar: rng() < 0.5 }];
  if (twoItems) {
    items.push({ recipe: 'toast', wantsButter: rng() < 0.5 });
  }
  return {
    id: `order-${Date.now()}-${Math.floor(rng() * 1e6)}`,
    items,
  };
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
