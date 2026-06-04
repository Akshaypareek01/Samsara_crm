import type { Trainer } from '@/services/trainerService';

/**
 * Approximate document creation time from a MongoDB ObjectId hex string.
 *
 * @param id - Trainer `_id` or `id`.
 * @returns Unix ms timestamp, or 0 when not parseable.
 */
export function mongoObjectIdTimestamp(id: string | undefined | null): number {
  if (!id || typeof id !== 'string' || id.length < 8) return 0;
  const seconds = parseInt(id.slice(0, 8), 16);
  return Number.isFinite(seconds) ? seconds * 1000 : 0;
}

/**
 * Resolves sortable creation time for a trainer (API may omit `createdAt`).
 *
 * @param trainer - Trainer list item.
 * @returns Unix ms timestamp.
 */
function trainerCreatedTimestamp(trainer: Trainer): number {
  if (trainer.createdAt) {
    const parsed = Date.parse(trainer.createdAt);
    if (Number.isFinite(parsed)) return parsed;
  }
  return mongoObjectIdTimestamp(trainer._id || trainer.id);
}

/**
 * Returns trainers ordered newest-first within a category row.
 *
 * @param trainers - Trainers from the list API.
 * @returns New array sorted by profile creation time (newest first).
 */
export function sortTrainersByNewest(trainers: Trainer[]): Trainer[] {
  return [...trainers].sort(
    (a, b) => trainerCreatedTimestamp(b) - trainerCreatedTimestamp(a)
  );
}
