import { orderValue, ITEM_PRICES } from './menu';
import { Order } from './types';

test('an order is worth the sum of its item prices', () => {
  const order: Order = {
    id: '1',
    items: [
      { recipe: 'coffee', wantsSugar: false },
      { recipe: 'toast', wantsButter: true },
    ],
  };
  expect(orderValue(order)).toBe(ITEM_PRICES.coffee + ITEM_PRICES.toast);
});

test('price does not depend on how the order was prepared', () => {
  const order: Order = { id: '2', items: [{ recipe: 'coffee', wantsSugar: true }] };
  expect(orderValue(order)).toBe(ITEM_PRICES.coffee);
});
