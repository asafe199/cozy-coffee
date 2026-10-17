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

export function describeOrder(order: Order): string {
  return order.items
    .map((item) =>
      item.recipe === 'coffee'
        ? `Coffee${item.wantsSugar ? ' with sugar' : ''}`
        : `Toast${item.wantsButter ? ' with butter' : ''}`,
    )
    .join(' + ');
}
