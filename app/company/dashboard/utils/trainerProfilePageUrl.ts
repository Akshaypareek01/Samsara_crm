import type { Trainer } from '@/services/trainerService';

/**
 * Resolves the Mongo/API id for a trainer record.
 *
 * @param trainer - Trainer object from list or detail APIs.
 */
export function getTrainerRecordId(trainer: Pick<Trainer, '_id' | 'id'>): string | undefined {
  return trainer._id || trainer.id || undefined;
}

/**
 * Builds the company trainer profile page URL with optional back-navigation target.
 *
 * @param trainerId - Trainer document id.
 * @param returnTo - Internal path to return to after viewing profile.
 */
export function trainerProfilePageUrl(trainerId: string, returnTo?: string): string {
  const path = `/company/dashboard/trainers/${encodeURIComponent(trainerId)}`;
  if (!returnTo) return path;
  return `${path}?returnTo=${encodeURIComponent(returnTo)}`;
}

/**
 * Validates a return URL is an internal company dashboard path.
 *
 * @param value - Raw `returnTo` query param.
 */
export function safeTrainerProfileReturnTo(value: string | null | undefined): string {
  if (value && value.startsWith('/company/') && !value.startsWith('//')) {
    return value;
  }
  return '/company/dashboard/trainers';
}
