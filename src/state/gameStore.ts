import { create } from 'zustand';
import { SceneId, Order, ItemPrep, ReviewResult } from '../game/types';
import { generateOrder, stationForItem } from '../game/orders';
import { calculateReview } from '../game/review';

interface GameState {
  scene: SceneId;
  isTransitioning: boolean;
  pendingScene: SceneId | null;
  currentOrder: Order | null;
  reviews: ReviewResult[];
  itemIndex: number;
  preps: (ItemPrep | null)[];
}

interface GameActions {
  requestNextOrder: () => void;
  /** Ensures an order exists (never overwrites one in flight) and returns the first station to visit. */
  beginOrder: () => SceneId;
  startTransition: (target: SceneId) => void;
  completeTransition: () => void;
  /** Records the current item's prep and returns the next scene to visit. */
  completeItem: (prep: ItemPrep | null) => SceneId;
  deliverOrder: () => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  // State
  scene: 'orderBoard',
  isTransitioning: false,
  pendingScene: null,
  currentOrder: null,
  reviews: [],
  itemIndex: 0,
  preps: [],

  // Actions
  requestNextOrder: () => {
    set({
      currentOrder: generateOrder(),
      itemIndex: 0,
      preps: [],
    } as Partial<GameStore>);
  },

  beginOrder: () => {
    if (!get().currentOrder) {
      get().requestNextOrder();
    }
    const order = get().currentOrder as Order;
    return stationForItem(order.items[get().itemIndex] ?? order.items[0]);
  },

  startTransition: (target: SceneId) => {
    const state = get();
    if (state.isTransitioning) {
      return; // no-op while already transitioning
    }
    set({
      isTransitioning: true,
      pendingScene: target,
    } as Partial<GameStore>);
  },

  completeTransition: () => {
    const state = get();
    if (state.pendingScene) {
      set({
        scene: state.pendingScene,
        isTransitioning: false,
        pendingScene: null,
      } as Partial<GameStore>);
    }
  },

  completeItem: (prep: ItemPrep | null) => {
    const state = get();
    const order = state.currentOrder;
    if (!order) {
      return 'orderBoard';
    }
    const preps = [...state.preps];
    preps[state.itemIndex] = prep;
    const nextIndex = state.itemIndex + 1;
    set({ preps, itemIndex: nextIndex } as Partial<GameStore>);
    const nextItem = order.items[nextIndex];
    return nextItem ? stationForItem(nextItem) : 'deliveryCounter';
  },

  deliverOrder: () => {
    const state = get();
    if (!state.currentOrder) {
      return; // no-op if there's no order to deliver
    }
    const review = calculateReview(state.currentOrder, state.preps);
    set({
      reviews: [...state.reviews, review],
      currentOrder: null,
      itemIndex: 0,
      preps: [],
    } as Partial<GameStore>);
  },
}));
