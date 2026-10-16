export type SceneId = 'orderBoard' | 'coffeeStation' | 'deliveryCounter';

export interface Order {
  id: string;
  recipe: 'coffee';
  wantsSugar: boolean;
}

export interface CoffeePrep {
  sugarAdded: boolean;
  prepTimeMs: number;
}

export interface ReviewResult {
  stars: 1 | 2 | 3 | 4 | 5;
  comments: string[];
}
