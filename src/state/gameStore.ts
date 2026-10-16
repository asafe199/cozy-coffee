import { create } from 'zustand';
import { SceneId, Order, CoffeePrep, ReviewResult } from '../game/types';

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
      currentOrder: {
        id: Math.random().toString(36).substring(7),
        recipe: 'coffee',
        wantsSugar: Math.random() > 0.5,
      },
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
    const review: ReviewResult = {
      stars: 5,
      comments: [],
    };
    set((state) => ({
      reviews: [...state.reviews, review],
      currentOrder: null,
    } as Partial<GameStore>));
  },
}));
