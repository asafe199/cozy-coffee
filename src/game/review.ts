import { Order, ItemPrep, ReviewResult } from './types';
import { JUICE_FLAVORS } from '../scenes/JuiceStation/flavors';

export const PREP_TIME_THRESHOLD_MS = 8000;
export const TOAST_MIN_MS = 1500;
export const TOAST_BURN_THRESHOLD_MS = 9000;
const UNPREPARED_PENALTY = 4;
const EXTRA_NAME = { juice: 'ice', pancakes: 'honey', salad: 'dressing' } as const;

/** Set equality, order-independent — the blender's final set vs. the flavor's recipe. */
function sameIngredientSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((x) => setA.has(x));
}

// `summary` is filled in by the caller (gameStore.deliverOrder), which has access to i18n;
// this function stays pure game logic.
export function calculateReview(order: Order, preps: (ItemPrep | null)[]): Omit<ReviewResult, 'summary'> {
  let stars = 5;
  const comments: string[] = [];

  order.items.forEach((item, index) => {
    const prep = preps[index] ?? null;
    if (prep === null || prep.recipe !== item.recipe) {
      comments.push('order_never_prepared');
      stars -= UNPREPARED_PENALTY;
      return;
    }

    if (item.recipe === 'coffee' && prep.recipe === 'coffee') {
      if (item.wantsSugar !== prep.sugarAdded) {
        comments.push('missing_sugar');
        stars--;
      }
      if (prep.prepTimeMs > PREP_TIME_THRESHOLD_MS) {
        comments.push('too_slow');
        stars--;
      }
    } else if (item.recipe === 'toast' && prep.recipe === 'toast') {
      if (item.wantsButter !== prep.butterAdded) {
        comments.push('missing_butter');
        stars--;
      }
      if (prep.toastedMs < TOAST_MIN_MS) {
        comments.push('untoasted_bread');
        stars--;
      } else if (prep.toastedMs > TOAST_BURN_THRESHOLD_MS) {
        comments.push('burned_toast');
        stars--;
      }
    } else if (item.recipe === 'juice' && prep.recipe === 'juice') {
      if (item.wantsExtra !== prep.extraAdded) {
        comments.push(`missing_${EXTRA_NAME.juice}`);
        stars--;
      }
      if (!sameIngredientSet(prep.ingredientsUsed, JUICE_FLAVORS[item.flavor].ingredients)) {
        comments.push('wrong_flavor');
        stars--;
      }
      if (prep.processMs < TOAST_MIN_MS) {
        comments.push('under_blended');
        stars--;
      } else if (prep.processMs > TOAST_BURN_THRESHOLD_MS) {
        comments.push('over_blended');
        stars--;
      }
    } else if (
      item.recipe !== 'coffee' &&
      item.recipe !== 'toast' &&
      item.recipe !== 'juice' &&
      prep.recipe === item.recipe
    ) {
      if (item.wantsExtra !== prep.extraAdded) {
        comments.push(`missing_${EXTRA_NAME[item.recipe]}`);
        stars--;
      }
      // Only pancakes can be under- or over-cooked; salad has no timing.
      if (item.recipe === 'pancakes') {
        if (prep.processMs < TOAST_MIN_MS) {
          comments.push('raw_pancakes');
          stars--;
        } else if (prep.processMs > TOAST_BURN_THRESHOLD_MS) {
          comments.push('burned_pancakes');
          stars--;
        }
      }
    }
  });

  stars = Math.max(1, stars);

  return {
    stars: stars as 1 | 2 | 3 | 4 | 5,
    comments,
  };
}
