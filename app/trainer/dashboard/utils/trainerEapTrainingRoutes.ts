/** Base route for trainer EAP program management. */
export const TRAINER_MY_TRAININGS_PATH = "/trainer/dashboard/my-trainings";

/**
 * Route for creating a new EAP training program.
 */
export function trainerEapTrainingCreatePath(): string {
  return `${TRAINER_MY_TRAININGS_PATH}/new`;
}

/**
 * Route for previewing an EAP training as companies see it.
 *
 * @param trainingId - Training Mongo id.
 */
export function trainerEapTrainingPreviewPath(trainingId: string): string {
  return `${TRAINER_MY_TRAININGS_PATH}/${trainingId}/preview`;
}

/**
 * Route for editing an EAP training program.
 *
 * @param trainingId - Training Mongo id.
 */
export function trainerEapTrainingEditPath(trainingId: string): string {
  return `${TRAINER_MY_TRAININGS_PATH}/${trainingId}/edit`;
}

/**
 * Resolve a training id from route params or training record.
 *
 * @param training - EAP training record.
 */
export function getEapTrainingRouteId(training: { _id?: string; id?: string }): string {
  return training._id || training.id || "";
}
