export type SceneId =
  | 'orderBoard'
  | 'coffeeStation'
  | 'toastStation'
  | 'juiceStation'
  | 'pancakeStation'
  | 'saladStation'
  | 'deliveryCounter';

/** Recipes that share one "process, then add an optional extra" interaction. */
export type ExtraRecipe = 'juice' | 'pancakes' | 'salad';

export type Recipe = 'coffee' | 'toast' | ExtraRecipe;

export type OrderItem =
  | { recipe: 'coffee'; wantsSugar: boolean }
  | { recipe: 'toast'; wantsButter: boolean }
  // The extra is ice (juice), honey (pancakes) or dressing (salad).
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

export interface ExtraPrep {
  recipe: ExtraRecipe;
  extraAdded: boolean;
  /** Time from starting the appliance to finishing (matters for pancakes only). */
  processMs: number;
}

export type ItemPrep = CoffeePrep | ToastPrep | ExtraPrep;

export interface ReviewResult {
  stars: 1 | 2 | 3 | 4 | 5;
  comments: string[];
}
