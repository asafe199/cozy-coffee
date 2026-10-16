import { Order, CoffeePrep, ReviewResult } from './types';

export const PREP_TIME_THRESHOLD_MS = 8000;

export function calculateReview(order: Order, prep: CoffeePrep | null): ReviewResult {
  if (prep === null) {
    return {
      stars: 1,
      comments: ['order_never_prepared'],
    };
  }

  let stars = 5;
  const comments: string[] = [];

  if (order.wantsSugar !== prep.sugarAdded) {
    comments.push('missing_sugar');
    stars--;
  }

  if (prep.prepTimeMs > PREP_TIME_THRESHOLD_MS) {
    comments.push('too_slow');
    stars--;
  }

  // Clamp stars to minimum 1
  stars = Math.max(1, stars);

  return {
    stars: stars as 1 | 2 | 3 | 4 | 5,
    comments,
  };
}
