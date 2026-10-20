import { create } from 'zustand';
import { SceneId, Order, ItemPrep, ReviewResult } from '../game/types';
import { describeOrder, generateOrder, stationForItem } from '../game/orders';
import { calculateReview } from '../game/review';
import { Clock, advanceClock, initialClock } from '../game/shift';
import { orderValue } from '../game/menu';
import { orderWords } from '../i18n';
import { clampLevel, levelConfig } from '../game/levels';
import { canEnqueue, takeFromQueue } from '../game/queue';
import { saveProgress, PersistedProgress } from '../game/persistence';

interface GameState {
  scene: SceneId;
  isTransitioning: boolean;
  pendingScene: SceneId | null;
  // -1/1 slides the transition left/right; 0 is a plain fade.
  transitionDir: -1 | 0 | 1;
  currentOrder: Order | null;
  /** Orders waiting on the board; the player may pick any of them. */
  queue: Order[];
  reviews: ReviewResult[];
  itemIndex: number;
  preps: (ItemPrep | null)[];
  day: number;
  clock: Clock;
  dayOver: boolean;
  dayEarnings: number;
  dayReviews: ReviewResult[];
  money: number;
  level: number;
}

interface GameActions {
  requestNextOrder: () => void;
  /** Ensures an order exists (never overwrites one in flight) and returns the first station to visit. */
  /** Accepts the chosen queued order (or the oldest) unless one is already in flight; returns the first station to visit. */
  beginOrder: (orderId?: string) => SceneId;
  /** A customer arrives: adds an order if the board has room and the shift budget allows. */
  enqueueOrder: () => void;
  startTransition: (target: SceneId, dir?: -1 | 0 | 1) => void;
  completeTransition: () => void;
  /** Records the current item's prep and returns the next scene to visit. */
  completeItem: (prep: ItemPrep | null) => SceneId;
  deliverOrder: () => void;
  startNextDay: () => void;
  /** Starts a fresh shift in the chosen cafe level. */
  selectLevel: (level: number) => void;
  hydrateProgress: (data: PersistedProgress) => void;
}

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  // State
  scene: 'orderBoard',
  isTransitioning: false,
  pendingScene: null,
  transitionDir: 0,
  currentOrder: null,
  queue: [],
  reviews: [],
  itemIndex: 0,
  preps: [],
  day: 1,
  clock: initialClock(),
  dayOver: false,
  dayEarnings: 0,
  dayReviews: [],
  money: 0,
  level: 1,

  // Actions
  requestNextOrder: () => {
    set({
      currentOrder: generateOrder(Math.random, get().level),
      itemIndex: 0,
      preps: [],
    } as Partial<GameStore>);
  },

  enqueueOrder: () => {
    const state = get();
    if (state.dayOver || !canEnqueue(state.queue.length, state.currentOrder !== null, state.clock.ordersServed, levelConfig(state.level).ordersPerShift)) {
      return;
    }
    set({ queue: [...state.queue, generateOrder(Math.random, state.level)] } as Partial<GameStore>);
  },

  beginOrder: (orderId?: string) => {
    if (!get().currentOrder) {
      const taken = takeFromQueue(get().queue, orderId);
      if (taken) {
        set({
          currentOrder: taken.order,
          queue: taken.rest,
          itemIndex: 0,
          preps: [],
        } as Partial<GameStore>);
      } else {
        // Never leave the player stuck on an empty board.
        get().requestNextOrder();
      }
    }
    const order = get().currentOrder as Order;
    return stationForItem(order.items[get().itemIndex] ?? order.items[0]);
  },

  startTransition: (target: SceneId, dir: -1 | 0 | 1 = 0) => {
    const state = get();
    if (state.isTransitioning) {
      return; // no-op while already transitioning
    }
    set({
      isTransitioning: true,
      pendingScene: target,
      transitionDir: dir,
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
    const review = { ...calculateReview(state.currentOrder, state.preps), summary: describeOrder(state.currentOrder, orderWords()) };
    const earned = orderValue(state.currentOrder, levelConfig(state.level).priceMultiplier);
    const { clock, dayEnded } = advanceClock(state.clock, levelConfig(state.level).ordersPerShift);
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
      queue: [],
    } as Partial<GameStore>);
    saveProgress({ day: get().day, money: get().money });
  },

  selectLevel: (level: number) => {
    set({
      level: clampLevel(level),
      scene: 'orderBoard',
      isTransitioning: false,
      pendingScene: null,
      currentOrder: null,
      queue: [],
      itemIndex: 0,
      preps: [],
      clock: initialClock(),
      dayOver: false,
      dayEarnings: 0,
      dayReviews: [],
    } as Partial<GameStore>);
  },

  hydrateProgress: (data: PersistedProgress) => {
    set({ day: data.day, money: data.money } as Partial<GameStore>);
  },
}));
