export type SceneId = 'orderBoard' | 'coffeeStation' | 'toastStation' | 'deliveryCounter';

export type Recipe = 'coffee' | 'toast';

export type OrderItem =
  | { recipe: 'coffee'; wantsSugar: boolean }
  | { recipe: 'toast'; wantsButter: boolean };

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

export type ItemPrep = CoffeePrep | ToastPrep;

export interface ReviewResult {
  stars: 1 | 2 | 3 | 4 | 5;
  comments: string[];
}
