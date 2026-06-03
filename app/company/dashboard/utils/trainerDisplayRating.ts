/**
 * Stable display rating for trainer cards when API has no reviews yet.
 *
 * @param seed - Trainer id or name used as hash input.
 * @returns Rating between 4.2 and 4.9 and a review count.
 */
export function trainerDisplayRating(seed: string): { rating: number; reviews: number } {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const abs = Math.abs(hash);
  const rating = 4.2 + (abs % 8) / 10;
  const reviews = 40 + (abs % 200);
  return { rating: Math.round(rating * 10) / 10, reviews };
}
