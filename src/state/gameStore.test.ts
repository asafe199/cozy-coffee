import { useGameStore } from './gameStore';
import { Order } from '../game/types';

const initialStateValues = {
  scene: 'orderBoard' as const,
  isTransitioning: false,
  pendingScene: null,
  currentOrder: null,
  reviews: [],
  itemIndex: 0,
  preps: [],
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
