import {
  TRAINER_CATEGORY_OPTIONS,
  type TrainerCategory,
} from '@/constants/trainerCategories';
import { HOME_TRAINER_CATEGORY_LABELS } from '@/app/company/dashboard/constants/homeTrainerCategories';
import type { Trainer } from '@/services/trainerService';

/** Legacy category values mapped to current enum labels. */
export const LEGACY_TRAINER_CATEGORY_ALIASES: Record<string, TrainerCategory> = {
  'Women Health Trainer': 'Ayurveda Doctor',
};

/**
 * Map a single legacy trainer category to the current enum value.
 *
 * @param category - Raw category string from API or form.
 */
export function mapLegacyTrainerCategory(category: string): string {
  const trimmed = category.trim();
  return LEGACY_TRAINER_CATEGORY_ALIASES[trimmed] ?? trimmed;
}

/**
 * Extract deduplicated raw category strings from API or form state.
 *
 * @param value - Single category or array from trainer record or form.
 */
function extractRawTrainerCategories(value: unknown): string[] {
  if (value == null) return [];

  const rawList = Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [String(value).trim()].filter(Boolean);

  return Array.from(new Set(rawList));
}

/**
 * Resolve trainer categories for forms and display, including legacy aliases.
 *
 * @param value - Raw category field from trainer record or form.
 */
export function resolveTrainerCategoriesForForm(value: unknown): TrainerCategory[] {
  const mapped = extractRawTrainerCategories(value).map(mapLegacyTrainerCategory);
  const unique = Array.from(new Set(mapped));
  return unique.filter((item): item is TrainerCategory =>
    TRAINER_CATEGORY_OPTIONS.includes(item as TrainerCategory)
  );
}

/**
 * Normalize trainer category from API or form state (legacy string or array).
 *
 * @param value - Raw category field from trainer record or form.
 * @returns Valid, deduplicated category enum values.
 */
export function normalizeTrainerCategories(value: unknown): TrainerCategory[] {
  return resolveTrainerCategoriesForForm(value);
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
  return resolveTrainerCategoriesForForm(trainer.category).includes(category as TrainerCategory);
}

/**
 * Human-readable labels for category badges.
 *
 * @param categories - Raw category value(s) from API or form.
 */
export function formatTrainerCategoryLabels(categories: unknown): string[] {
  return resolveTrainerCategoriesForForm(categories).map(
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
