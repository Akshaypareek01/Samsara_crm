import type { Trainer } from '@/services/trainerService';
import type { EapTraining } from '@/services/eapTrainingService';

/** Populated trainer fields on an EAP training record. */
export type EapTrainingTrainerRef = Pick<
  Trainer,
  'name' | 'title' | 'bio' | 'specialistIn' | 'city' | 'experience' | 'profilePhoto' | 'status' | 'acceptingBookings' | 'category'
> & {
  _id?: string;
  id?: string;
};

/** Trainer shape used on EAP landing showcase cards. */
export type EapLandingTrainer = Trainer | EapTrainingTrainerRef;

/**
 * Resolve populated trainer from an EAP training record.
 *
 * @param training - EAP training with optional populated trainer.
 */
export function getEapTrainingTrainer(training: EapTraining | null | undefined): EapTrainingTrainerRef | null {
  if (!training?.trainer || typeof training.trainer !== 'object') return null;
  return training.trainer as EapTrainingTrainerRef;
}

/**
 * Trainer Mongo id from an EAP training record.
 *
 * @param training - EAP training record.
 */
export function getEapTrainingTrainerId(training: EapTraining | null | undefined): string {
  if (!training) return '';
  const trainer = training.trainer;
  if (typeof trainer === 'string') return trainer;
  const ref = getEapTrainingTrainer(training);
  return ref?._id || ref?.id || '';
}

/**
 * Profile photo URL for the trainer on an EAP training.
 *
 * @param training - EAP training record.
 */
export function getEapTrainingTrainerPhoto(training: EapTraining | null | undefined): string {
  return getEapTrainingTrainer(training)?.profilePhoto?.path || '';
}
