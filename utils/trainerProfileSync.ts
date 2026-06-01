import type { TrainerImage } from '@/services/trainerService';

/** Browser event so trainer header stays in sync after profile edits. */
export const TRAINER_PROFILE_UPDATED_EVENT = 'samsara:trainer-profile-updated';

export type TrainerProfileUpdatedDetail = {
  name: string;
  title?: string;
  profilePhoto?: TrainerImage | null;
};

/**
 * Broadcasts profile identity changes to other trainer dashboard UI (e.g. header).
 *
 * @param detail - Name, title and profile photo to display in the shell.
 */
export function broadcastTrainerProfileUpdated(detail: TrainerProfileUpdatedDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<TrainerProfileUpdatedDetail>(TRAINER_PROFILE_UPDATED_EVENT, { detail })
  );
}
