import { useGameStore } from './gameStore';

const initialStateValues = {
  scene: 'orderBoard' as const,
  isTransitioning: false,
  pendingScene: null,
  currentOrder: null,
  reviews: [],
  pendingPrep: null,
};

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

test('deliverOrder appends a review and clears currentOrder', () => {
  useGameStore.getState().requestNextOrder();
  useGameStore.getState().deliverOrder({ sugarAdded: true, prepTimeMs: 1000 });
  const s = useGameStore.getState();
  expect(s.reviews).toHaveLength(1);
  expect(s.currentOrder).toBeNull();
});
