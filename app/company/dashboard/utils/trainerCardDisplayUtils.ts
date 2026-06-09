import type { Trainer } from '@/services/trainerService';
import { HOME_TRAINER_CATEGORY_LABELS } from '../constants/homeTrainerCategories';

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
 * Human-readable category label for a trainer.
 *
 * @param trainer - Trainer record from the API.
 */
export function trainerCategoryLabel(trainer: Trainer): string | null {
  const cat = trainer.category;
  if (!cat) return null;
  const key = cat as keyof typeof HOME_TRAINER_CATEGORY_LABELS;
  return HOME_TRAINER_CATEGORY_LABELS[key] || String(cat);
}

/**
 * Location line from the trainer city field.
 *
 * @param trainer - Trainer record from the API.
 */
export function trainerLocationLine(trainer: Trainer): string | null {
  const city = trainer.city?.trim();
  return city || null;
}
