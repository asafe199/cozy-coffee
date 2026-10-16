import { Order, ItemPrep, ReviewResult } from './types';

export const PREP_TIME_THRESHOLD_MS = 8000;
export const TOAST_MIN_MS = 1500;
export const TOAST_BURN_THRESHOLD_MS = 9000;
const UNPREPARED_PENALTY = 4;

export function calculateReview(order: Order, preps: (ItemPrep | null)[]): ReviewResult {
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
    }
  });

  stars = Math.max(1, stars);

  return {
    stars: stars as 1 | 2 | 3 | 4 | 5,
    comments,
  };
}
