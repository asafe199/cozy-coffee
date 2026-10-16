import { Order } from './types';

export function generateOrder(rng: () => number = Math.random): Order {
  return {
    id: `order-${Date.now()}-${Math.floor(rng() * 1e6)}`,
    recipe: 'coffee',
    wantsSugar: rng() < 0.5,
  };
}
