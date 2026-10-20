export type SceneId =
  | 'orderBoard'
  | 'coffeeStation'
  | 'toastStation'
  | 'juiceStation'
  | 'pancakeStation'
  | 'saladStation'
  | 'deliveryCounter';

/** Recipes that share one "process, then add an optional extra" interaction. */
export type ExtraRecipe = 'pancakes' | 'salad';

export type Recipe = 'coffee' | 'toast' | 'juice' | ExtraRecipe;

/** The 10 real juice/milkshake recipes (see JUICE_FLAVORS for ingredients/color). */
export type JuiceFlavor =
  | 'orange'
  | 'lemonade'
  | 'watermelon'
  | 'mango'
  | 'pineapple'
  | 'strawberryBanana'
  | 'mangoPineapple'
  | 'milkshakeChocolate'
  | 'milkshakeStrawberry'
  | 'milkshakeVanilla';

/** The 9 ingredient baskets behind the blender. */
export type FruitId =
  | 'orange'
  | 'lemon'
  | 'watermelon'
  | 'mango'
  | 'pineapple'
  | 'strawberry'
  | 'banana'
  | 'chocolate'
  | 'vanilla';

export type OrderItem =
  | { recipe: 'coffee'; wantsSugar: boolean }
  | { recipe: 'toast'; wantsButter: boolean }
  // Ice is independent of flavor, same as the other extras below.
  | { recipe: 'juice'; flavor: JuiceFlavor; wantsExtra: boolean }
  // The extra is honey (pancakes) or dressing (salad).
  | { recipe: ExtraRecipe; wantsExtra: boolean };

export interface Order {
  id: string;
  items: OrderItem[];
}

export interface CoffeePrep {
  recipe: 'coffee';
  sugarAdded: boolean;
  prepTimeMs: number;
}

export interface ToastPrep {
  recipe: 'toast';
  butterAdded: boolean;
  toastedMs: number;
}

export interface JuicePrep {
  recipe: 'juice';
  flavor: JuiceFlavor;
  /** The set of baskets actually dragged into the blender before it was started. */
  ingredientsUsed: FruitId[];
  extraAdded: boolean;
  /** Time from starting the blender to finishing (under/over-blended penalty). */
  processMs: number;
}

export interface ExtraPrep {
  recipe: ExtraRecipe;
  extraAdded: boolean;
  /** Time from starting the appliance to finishing (matters for pancakes only). */
  processMs: number;
}

export type ItemPrep = CoffeePrep | ToastPrep | JuicePrep | ExtraPrep;

export interface ReviewResult {
  stars: 1 | 2 | 3 | 4 | 5;
  comments: string[];
  /** Human-readable order description (describeOrder), for the review history list. */
  summary: string;
}
