import {
  TRAINER_CATEGORY_OPTIONS,
  type TrainerCategory,
} from '@/constants/trainerCategories';
import { HOME_TRAINER_CATEGORY_LABELS } from '@/app/company/dashboard/constants/homeTrainerCategories';
import type { Trainer } from '@/services/trainerService';

/**
 * Normalize trainer category from API or form state (legacy string or array).
 *
 * @param value - Raw category field from trainer record or form.
 * @returns Valid, deduplicated category enum values.
 */
export function normalizeTrainerCategories(value: unknown): TrainerCategory[] {
  if (value == null) return [];

  const rawList = Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [String(value).trim()].filter(Boolean);

  const unique = [...new Set(rawList)];
  return unique.filter((item): item is TrainerCategory =>
    TRAINER_CATEGORY_OPTIONS.includes(item as TrainerCategory)
  );
}

/**
 * Whether a trainer belongs to a given category.
 *
 * @param trainer - Trainer record or object with a `category` field.
 * @param category - Category enum value to check.
 */
export function trainerHasCategory(
  trainer: Pick<Trainer, 'category'> | null | undefined,
  category: TrainerCategory | string
): boolean {
  if (!trainer) return false;
  return normalizeTrainerCategories(trainer.category).includes(category as TrainerCategory);
}

/**
 * Human-readable labels for category badges.
 *
 * @param categories - Raw category value(s) from API or form.
 */
export function formatTrainerCategoryLabels(categories: unknown): string[] {
  return normalizeTrainerCategories(categories).map(
    (cat) => HOME_TRAINER_CATEGORY_LABELS[cat] || cat
  );
}

/**
 * Category display labels for a trainer profile or card.
 *
 * @param trainer - Trainer record from the API.
 */
export function trainerCategoryLabels(trainer: Trainer): string[] {
  return formatTrainerCategoryLabels(trainer.category);
}

/**
 * Comma-separated category label for compact single-line display.
 *
 * @param trainer - Trainer record from the API.
 */
export function trainerCategoryLabel(trainer: Trainer): string | null {
  const labels = trainerCategoryLabels(trainer);
  return labels.length > 0 ? labels.join(', ') : null;
}
