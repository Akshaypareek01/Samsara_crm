import type { Trainer } from '@/services/trainerService';
import {
  trainerCategoryLabel,
  trainerCategoryLabels,
} from '@/shared/utils/trainerCategoryUtils';
import { formatTrainerCities, normalizeTrainerCities } from '@/shared/utils/trainerCityUtils';

export { trainerCategoryLabel, trainerCategoryLabels };

/**
 * Professional title line for trainer cards (e.g. "Certified Yoga Instructor").
 *
 * @param trainer - Trainer record from the API.
 */
export function trainerSpecialtyLabel(trainer: Trainer): string {
  const title = trainer.title?.trim();
  if (title) return title;
  return 'Wellness specialist';
}

/**
 * Training program labels for display chips.
 *
 * @param trainer - Trainer record from the API.
 */
export function trainerTrainingLabels(trainer: Trainer): string[] {
  if (Array.isArray(trainer.typeOfTraining)) {
    return trainer.typeOfTraining.slice(0, 2);
  }
  if (typeof trainer.typeOfTraining === 'string' && trainer.typeOfTraining) {
    return [trainer.typeOfTraining];
  }
  return [];
}

/**
 * Location line from the trainer city field.
 *
 * @param trainer - Trainer record from the API.
 */
export function trainerLocationLine(trainer: Trainer): string | null {
  const cities = formatTrainerCities(normalizeTrainerCities(trainer));
  return cities || null;
}
