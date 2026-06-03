import { TRAINER_CATEGORY_OPTIONS } from '@/constants/trainerCategories';

/**
 * Validates a trainer category value from the query string.
 *
 * @param value - Raw `category` query param.
 */
export function isValidTrainerCategory(
  value: string | null | undefined
): value is (typeof TRAINER_CATEGORY_OPTIONS)[number] {
  if (!value) return false;
  return TRAINER_CATEGORY_OPTIONS.includes(
    value as (typeof TRAINER_CATEGORY_OPTIONS)[number]
  );
}

/**
 * Builds the trainers list URL with an optional category filter.
 *
 * @param category - API category value (e.g. "Yoga Trainer").
 */
export function trainersPageUrl(category?: string): string {
  const base = '/company/dashboard/trainers';
  if (category && isValidTrainerCategory(category)) {
    return `${base}?category=${encodeURIComponent(category)}`;
  }
  return base;
}
