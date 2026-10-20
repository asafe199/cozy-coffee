import type { FruitId, JuiceFlavor } from '../../game/types';
import type { ModelData } from '../shared/props/modelData';
import {
  FRUIT_ORANGE,
  FRUIT_LEMON,
  FRUIT_WATERMELON,
  FRUIT_PINEAPPLE,
  FRUIT_STRAWBERRY,
  FRUIT_BANANA,
  FRUIT_CHOCOLATE,
  FRUIT_MANGO,
  FRUIT_VANILLA,
} from '../shared/props/juiceFruits.generated';
import {
  BASKET_ORANGE,
  BASKET_LEMON,
  BASKET_WATERMELON,
  BASKET_PINEAPPLE,
  BASKET_STRAWBERRY,
  BASKET_BANANA,
  BASKET_CHOCOLATE,
  BASKET_MANGO,
  BASKET_VANILLA,
} from '../shared/props/juiceIngredients.generated';

/** The single fruit/scoop a player drags into the blender, one per ingredient. */
export const FRUIT_MODELS: Record<FruitId, ModelData> = {
  orange: FRUIT_ORANGE,
  lemon: FRUIT_LEMON,
  watermelon: FRUIT_WATERMELON,
  pineapple: FRUIT_PINEAPPLE,
  strawberry: FRUIT_STRAWBERRY,
  banana: FRUIT_BANANA,
  chocolate: FRUIT_CHOCOLATE,
  mango: FRUIT_MANGO,
  vanilla: FRUIT_VANILLA,
};

/** Decorative basket (bowl + 1-3 of the ingredient) shown behind the blender; never draggable. */
export const BASKET_MODELS: Record<FruitId, ModelData> = {
  orange: BASKET_ORANGE,
  lemon: BASKET_LEMON,
  watermelon: BASKET_WATERMELON,
  pineapple: BASKET_PINEAPPLE,
  strawberry: BASKET_STRAWBERRY,
  banana: BASKET_BANANA,
  chocolate: BASKET_CHOCOLATE,
  mango: BASKET_MANGO,
  vanilla: BASKET_VANILLA,
};

export const FRUIT_IDS: FruitId[] = [
  'orange',
  'lemon',
  'watermelon',
  'pineapple',
  'strawberry',
  'banana',
  'chocolate',
  'mango',
  'vanilla',
];

interface FlavorSpec {
  ingredients: FruitId[];
  color: string;
}

// 10 real recipes (researched, not invented combos — see design doc Part A).
export const JUICE_FLAVORS: Record<JuiceFlavor, FlavorSpec> = {
  orange: { ingredients: ['orange'], color: '#F2A33A' },
  lemonade: { ingredients: ['lemon'], color: '#E8E04A' },
  watermelon: { ingredients: ['watermelon'], color: '#F2546B' },
  mango: { ingredients: ['mango'], color: '#F7B733' },
  pineapple: { ingredients: ['pineapple'], color: '#F0D43A' },
  strawberryBanana: { ingredients: ['strawberry', 'banana'], color: '#E67A9E' },
  mangoPineapple: { ingredients: ['mango', 'pineapple'], color: '#F5C542' },
  milkshakeChocolate: { ingredients: ['chocolate'], color: '#5C3A28' },
  milkshakeStrawberry: { ingredients: ['strawberry'], color: '#F2A0C0' },
  milkshakeVanilla: { ingredients: ['vanilla'], color: '#F5EBDC' },
};

export const JUICE_FLAVOR_IDS = Object.keys(JUICE_FLAVORS) as JuiceFlavor[];

/** Neutral fallback color for a glass whose current contents match no exact flavor. */
export const NEUTRAL_LIQUID_COLOR = '#8a7a5a';
