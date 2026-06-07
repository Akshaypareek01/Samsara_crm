"use client";

import { useCallback, useEffect, useState } from "react";
import EapTrainingService, { type EapTraining } from "@/services/eapTrainingService";
import type { Trainer } from "@/services/trainerService";
import { sortTrainersByNewest } from "@/app/company/dashboard/utils/sortTrainersByNewest";

export const EAP_FEATURED_LIMIT = 6;

/**
 * Resolves sortable creation time for an EAP training record.
 *
 * @param training - Training list item.
 */
function trainingCreatedTimestamp(training: EapTraining): number {
  if (training.createdAt) {
    const parsed = Date.parse(training.createdAt);
    if (Number.isFinite(parsed)) return parsed;
  }
  const id = training._id || training.id;
  if (!id || id.length < 8) return 0;
  const seconds = parseInt(id.slice(0, 8), 16);
  return Number.isFinite(seconds) ? seconds * 1000 : 0;
}

/**
 * Orders EAP trainings newest-first (fallback to ObjectId timestamp).
 *
 * @param trainings - Training list from the API.
 */
export function sortEapTrainingsByNewest(trainings: EapTraining[]): EapTraining[] {
  return [...trainings].sort(
    (a, b) => trainingCreatedTimestamp(b) - trainingCreatedTimestamp(a)
  );
}

type UseCompanyEapLandingResult = {
  trainers: Trainer[];
  trainings: EapTraining[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Loads the newest featured EAP trainers and training programs for the company landing row.
 */
export function useCompanyEapLanding(): UseCompanyEapLandingResult {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [trainings, setTrainings] = useState<EapTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const landing = await EapTrainingService.getCompanyLanding();
      const sortedTrainers = sortTrainersByNewest(landing.trainers ?? []).slice(
        0,
        EAP_FEATURED_LIMIT
      );
      const sortedTrainings = sortEapTrainingsByNewest(landing.trainings ?? []).slice(
        0,
        EAP_FEATURED_LIMIT
      );
      setTrainers(sortedTrainers);
      setTrainings(sortedTrainings);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to load featured EAP data";
      setError(message);
      setTrainers([]);
      setTrainings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { trainers, trainings, loading, error, refetch };
}
