"use client";

import { useCallback, useEffect, useState } from 'react';
import TrainerService, { Trainer } from '@/services/trainerService';
import {
  HOME_TRAINER_CATEGORIES,
  type HomeTrainerCategory,
} from '@/app/company/dashboard/constants/homeTrainerCategories';
import { sortTrainersByNewest } from '@/app/company/dashboard/utils/sortTrainersByNewest';

const TRAINERS_PER_CATEGORY = 6;

export type CategoryTrainersMap = Record<HomeTrainerCategory, Trainer[]>;

type UseCompanyHomeTrainersResult = {
  byCategory: CategoryTrainersMap;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

const emptyMap = (): CategoryTrainersMap => {
  const map = {} as CategoryTrainersMap;
  for (const { category } of HOME_TRAINER_CATEGORIES) {
    map[category] = [];
  }
  return map;
};

/**
 * Loads featured trainers for each wellness category on the company home dashboard.
 */
export function useCompanyHomeTrainers(): UseCompanyHomeTrainersResult {
  const [byCategory, setByCategory] = useState<CategoryTrainersMap>(emptyMap);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.all(
        HOME_TRAINER_CATEGORIES.map(({ category }) =>
          TrainerService.getTrainers({
            status: true,
            acceptingBookings: true,
            category,
            page: 1,
            limit: TRAINERS_PER_CATEGORY,
            sortBy: 'createdAt:desc',
          }).then((res) => ({
            category,
            trainers: sortTrainersByNewest(res.results ?? []),
          }))
        )
      );

      const next = emptyMap();
      for (const { category, trainers } of results) {
        next[category] = trainers;
      }
      setByCategory(next);
    } catch (e: unknown) {
      const message =
        e instanceof Error ? e.message : 'Failed to load trainers';
      setError(message);
      setByCategory(emptyMap());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { byCategory, loading, error, refetch };
}
