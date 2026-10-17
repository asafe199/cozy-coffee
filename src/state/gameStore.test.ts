jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
import { useGameStore, GameStore } from './gameStore';
import { Order } from '../game/types';
import { initialClock, ORDERS_PER_SHIFT } from '../game/shift';

const initialStateValues = {
  scene: 'orderBoard' as const,
  isTransitioning: false,
  pendingScene: null,
  currentOrder: null,
  queue: [] as Order[],
  reviews: [],
  itemIndex: 0,
  preps: [],
  day: 1,
  clock: initialClock(),
  dayOver: false,
  dayEarnings: 0,
  dayReviews: [],
  money: 0,
};

const comboOrder: Order = {
  id: 'combo',
  items: [
    { recipe: 'coffee', wantsSugar: true },
    { recipe: 'toast', wantsButter: true },
  ],
};
const coffeeOnly: Order = { id: 'solo', items: [{ recipe: 'coffee', wantsSugar: false }] };

beforeEach(() => {
  useGameStore.setState(initialStateValues);
});

test('initial state has no current order and is not transitioning', () => {
  const s = useGameStore.getState();
  expect(s.currentOrder).toBeNull();
  expect(s.isTransitioning).toBe(false);
  expect(s.scene).toBe('orderBoard');
});

test('startTransition sets isTransitioning and pendingScene', () => {
  useGameStore.getState().startTransition('coffeeStation');
  const s = useGameStore.getState();
  expect(s.isTransitioning).toBe(true);
  expect(s.pendingScene).toBe('coffeeStation');
  expect(s.scene).toBe('orderBoard'); // not swapped yet
});

test('startTransition is a no-op while already transitioning', () => {
  useGameStore.getState().startTransition('coffeeStation');
  useGameStore.getState().startTransition('deliveryCounter');
  expect(useGameStore.getState().pendingScene).toBe('coffeeStation');
});

test('completeTransition swaps scene and clears the flag', () => {
  useGameStore.getState().startTransition('coffeeStation');
  useGameStore.getState().completeTransition();
  const s = useGameStore.getState();
  expect(s.scene).toBe('coffeeStation');
  expect(s.isTransitioning).toBe(false);
  expect(s.pendingScene).toBeNull();
});

test('deliverOrder appends a review and clears order progress', () => {
  useGameStore.setState({ currentOrder: coffeeOnly });
  useGameStore.getState().completeItem({ recipe: 'coffee', sugarAdded: false, prepTimeMs: 1000 });
  useGameStore.getState().deliverOrder();
  const s = useGameStore.getState();
  expect(s.reviews).toHaveLength(1);
  expect(s.reviews[0].stars).toBe(5);
  expect(s.currentOrder).toBeNull();
  expect(s.itemIndex).toBe(0);
  expect(s.preps).toEqual([]);
});

test('deliverOrder with nothing prepared is a worst-case review, not a crash', () => {
  useGameStore.setState({ currentOrder: comboOrder });
  useGameStore.getState().deliverOrder();
  expect(useGameStore.getState().reviews[0].stars).toBe(1);
});

test('deliverOrder is a no-op without an order', () => {
  useGameStore.getState().deliverOrder();
  expect(useGameStore.getState().reviews).toHaveLength(0);
});

test('beginOrder creates an order when none exists and returns the first station', () => {
  const next = useGameStore.getState().beginOrder();
  expect(useGameStore.getState().currentOrder).not.toBeNull();
  expect(next).toBe('coffeeStation');
});

test('beginOrder does not overwrite an in-flight order', () => {
  useGameStore.setState({ currentOrder: comboOrder });
  useGameStore.getState().beginOrder();
  expect(useGameStore.getState().currentOrder).toBe(comboOrder);
});

test('single-item order routes straight to the delivery counter', () => {
  useGameStore.setState({ currentOrder: coffeeOnly });
  const next = useGameStore.getState().completeItem({ recipe: 'coffee', sugarAdded: false, prepTimeMs: 1 });
  expect(next).toBe('deliveryCounter');
});

test('two-item order routes coffee -> toast -> delivery', () => {
  useGameStore.setState({ currentOrder: comboOrder });
  const afterCoffee = useGameStore.getState().completeItem({ recipe: 'coffee', sugarAdded: true, prepTimeMs: 1 });
  expect(afterCoffee).toBe('toastStation');
  const afterToast = useGameStore.getState().completeItem({ recipe: 'toast', butterAdded: true, toastedMs: 3000 });
  expect(afterToast).toBe('deliveryCounter');
  expect(useGameStore.getState().preps).toHaveLength(2);
});

test('skipping an item (null prep) is recorded and still routes onward', () => {
  useGameStore.setState({ currentOrder: comboOrder });
  const next = useGameStore.getState().completeItem(null);
  expect(next).toBe('toastStation');
  expect(useGameStore.getState().preps).toEqual([null]);
});

test('requestNextOrder resets item progress', () => {
  useGameStore.setState({ currentOrder: comboOrder, itemIndex: 1, preps: [null] });
  useGameStore.getState().requestNextOrder();
  const s = useGameStore.getState();
  expect(s.itemIndex).toBe(0);
  expect(s.preps).toEqual([]);
});

test('enqueueOrder adds orders up to the pending cap', () => {
  for (let i = 0; i < 5; i++) useGameStore.getState().enqueueOrder();
  expect(useGameStore.getState().queue).toHaveLength(3);
});

test('enqueueOrder does nothing while the day is over', () => {
  useGameStore.setState({ dayOver: true });
  useGameStore.getState().enqueueOrder();
  expect(useGameStore.getState().queue).toHaveLength(0);
});

test('beginOrder(id) takes the chosen order out of the queue', () => {
  const other: Order = { id: 'other', items: [{ recipe: 'toast', wantsButter: false }] };
  useGameStore.setState({ queue: [coffeeOnly, other] });
  const next = useGameStore.getState().beginOrder('other');
  const s = useGameStore.getState();
  expect(s.currentOrder).toBe(other);
  expect(s.queue).toEqual([coffeeOnly]);
  expect(next).toBe('toastStation');
});

test('beginOrder without id takes the oldest queued order', () => {
  useGameStore.setState({ queue: [coffeeOnly, comboOrder] });
  useGameStore.getState().beginOrder();
  expect(useGameStore.getState().currentOrder).toBe(coffeeOnly);
  expect(useGameStore.getState().queue).toEqual([comboOrder]);
});

test('beginOrder with an in-flight order ignores the queue', () => {
  useGameStore.setState({ currentOrder: comboOrder, queue: [coffeeOnly] });
  useGameStore.getState().beginOrder('solo');
  expect(useGameStore.getState().currentOrder).toBe(comboOrder);
  expect(useGameStore.getState().queue).toEqual([coffeeOnly]);
});

function serveOrders(count: number) {
  for (let i = 0; i < count; i++) {
    useGameStore.setState({ currentOrder: coffeeOnly, itemIndex: 0, preps: [] });
    useGameStore.getState().deliverOrder();
  }
}

test('delivering earns money and advances the clock', () => {
  serveOrders(1);
  const s = useGameStore.getState();
  expect(s.money).toBe(3);
  expect(s.dayEarnings).toBe(3);
  expect(s.clock.ordersServed).toBe(1);
  expect(s.dayReviews).toHaveLength(1);
  expect(s.dayOver).toBe(false);
});

test('serving a full day (two shifts) ends the day', () => {
  serveOrders(ORDERS_PER_SHIFT);
  expect(useGameStore.getState().clock.shift).toBe('afternoon');
  expect(useGameStore.getState().dayOver).toBe(false);
  serveOrders(ORDERS_PER_SHIFT);
  expect(useGameStore.getState().dayOver).toBe(true);
});

test('startNextDay resets the day but keeps money and lifetime reviews', () => {
  serveOrders(ORDERS_PER_SHIFT * 2);
  const before = useGameStore.getState();
  useGameStore.getState().startNextDay();
  const s = useGameStore.getState();
  expect(s.day).toBe(2);
  expect(s.dayOver).toBe(false);
  expect(s.dayEarnings).toBe(0);
  expect(s.dayReviews).toEqual([]);
  expect(s.clock.shift).toBe('morning');
  expect(s.money).toBe(before.money);
  expect(s.reviews).toHaveLength(before.reviews.length);
});

test('startNextDay is a no-op while the day is still running', () => {
  useGameStore.getState().startNextDay();
  expect(useGameStore.getState().day).toBe(1);
});

test('hydrateProgress applies a loaded day and money onto the store', () => {
  useGameStore.getState().hydrateProgress({ day: 5, money: 120 });
  const s = useGameStore.getState();
  expect(s.day).toBe(5);
  expect(s.money).toBe(120);
});

test('deliverOrder persists the updated day/money', async () => {
  const saveProgress = jest.spyOn(require('../game/persistence'), 'saveProgress')
    .mockResolvedValue(undefined);
  useGameStore.getState().requestNextOrder();
  useGameStore.getState().beginOrder();
  useGameStore.getState().deliverOrder();
  await Promise.resolve(); // let the fire-and-forget save's microtask run
  expect(saveProgress).toHaveBeenCalledWith({
    day: useGameStore.getState().day,
    money: useGameStore.getState().money,
  });
});

test('startNextDay persists the updated day', async () => {
  const saveProgress = jest.spyOn(require('../game/persistence'), 'saveProgress')
    .mockResolvedValue(undefined);
  useGameStore.setState({ dayOver: true } as Partial<GameStore>);
  useGameStore.getState().startNextDay();
  await Promise.resolve();
  expect(saveProgress).toHaveBeenCalledWith({
    day: useGameStore.getState().day,
    money: useGameStore.getState().money,
  });
});

test('startNextDay clears the waiting queue', () => {
  useGameStore.setState({ dayOver: true, queue: [coffeeOnly] });
  useGameStore.getState().startNextDay();
  expect(useGameStore.getState().queue).toEqual([]);
});
