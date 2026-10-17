import { create } from 'zustand';
import { SceneId, Order, ItemPrep, ReviewResult } from '../game/types';
import { generateOrder, stationForItem } from '../game/orders';
import { calculateReview } from '../game/review';
import { Clock, advanceClock, initialClock } from '../game/shift';
import { orderValue } from '../game/menu';
import { saveProgress, PersistedProgress } from '../game/persistence';

interface GameState {
  scene: SceneId;
  isTransitioning: boolean;
  pendingScene: SceneId | null;
  currentOrder: Order | null;
  reviews: ReviewResult[];
  itemIndex: number;
  preps: (ItemPrep | null)[];
  day: number;
  clock: Clock;
  dayOver: boolean;
  dayEarnings: number;
  dayReviews: ReviewResult[];
  money: number;
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
  startNextDay: () => void;
  hydrateProgress: (data: PersistedProgress) => void;
}

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  // State
  scene: 'orderBoard',
  isTransitioning: false,
  pendingScene: null,
  currentOrder: null,
  reviews: [],
  itemIndex: 0,
  preps: [],
  day: 1,
  clock: initialClock(),
  dayOver: false,
  dayEarnings: 0,
  dayReviews: [],
  money: 0,

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
    const earned = orderValue(state.currentOrder);
    const { clock, dayEnded } = advanceClock(state.clock);
    set({
      reviews: [...state.reviews, review],
      dayReviews: [...state.dayReviews, review],
      dayEarnings: state.dayEarnings + earned,
      money: state.money + earned,
      clock,
      dayOver: dayEnded,
      currentOrder: null,
      itemIndex: 0,
      preps: [],
    } as Partial<GameStore>);
    saveProgress({ day: get().day, money: get().money });
  },

  startNextDay: () => {
    if (!get().dayOver) {
      return;
    }
    set({
      day: get().day + 1,
      clock: initialClock(),
      dayOver: false,
      dayEarnings: 0,
      dayReviews: [],
    } as Partial<GameStore>);
    saveProgress({ day: get().day, money: get().money });
  },

  hydrateProgress: (data: PersistedProgress) => {
    set({ day: data.day, money: data.money } as Partial<GameStore>);
  },
}));
