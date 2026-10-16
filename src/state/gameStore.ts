import { create } from 'zustand';
import { SceneId, Order, CoffeePrep, ReviewResult } from '../game/types';
import { generateOrder } from '../game/orders';
import { calculateReview } from '../game/review';

interface GameState {
  scene: SceneId;
  isTransitioning: boolean;
  pendingScene: SceneId | null;
  currentOrder: Order | null;
  reviews: ReviewResult[];
}

interface GameActions {
  requestNextOrder: () => void;
  startTransition: (target: SceneId) => void;
  completeTransition: () => void;
  deliverOrder: (prep: CoffeePrep | null) => void;
}

type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>((set, get) => ({
  // State
  scene: 'orderBoard',
  isTransitioning: false,
  pendingScene: null,
  currentOrder: null,
  reviews: [],

  // Actions
  requestNextOrder: () => {
    set({
      currentOrder: generateOrder(),
    } as Partial<GameStore>);
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

  deliverOrder: (prep: CoffeePrep | null) => {
    const state = get();
    if (!state.currentOrder) {
      return; // no-op if there's no order to deliver
    }
    const review = calculateReview(state.currentOrder, prep);
    set({
      reviews: [...state.reviews, review],
      currentOrder: null,
    } as Partial<GameStore>);
  },
}));
