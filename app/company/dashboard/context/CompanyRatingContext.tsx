"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import TrainerRatingService, {
  type PendingRatingAlert,
} from "@/services/trainerRatingService";
import CompanyTrainerRatingDrawer from "../components/CompanyTrainerRatingDrawer";

type CompanyRatingContextValue = {
  pendingAlerts: PendingRatingAlert[];
  pendingCount: number;
  pendingBookingIds: Set<string>;
  loadingPending: boolean;
  refreshPending: () => Promise<void>;
  openRatingDrawer: (bookingId: string) => void;
  closeRatingDrawer: () => void;
  ratingDrawerBookingId: string | null;
};

const CompanyRatingContext = createContext<CompanyRatingContextValue | null>(null);

/**
 * Provides pending rating alerts and drawer control across the company dashboard.
 */
export function CompanyRatingProvider({ children }: { children: React.ReactNode }) {
  const [pendingAlerts, setPendingAlerts] = useState<PendingRatingAlert[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingPending, setLoadingPending] = useState(false);
  const [ratingDrawerBookingId, setRatingDrawerBookingId] = useState<string | null>(null);

  const refreshPending = useCallback(async () => {
    try {
      setLoadingPending(true);
      const data = await TrainerRatingService.getPendingRatings({ limit: 20 });
      setPendingAlerts(data.results || []);
      setPendingCount(data.totalResults || 0);
    } catch (err) {
      console.error("Failed to load pending ratings:", err);
      setPendingAlerts([]);
      setPendingCount(0);
    } finally {
      setLoadingPending(false);
    }
  }, []);

  useEffect(() => {
    void refreshPending();
  }, [refreshPending]);

  const openRatingDrawer = useCallback((bookingId: string) => {
    setRatingDrawerBookingId(bookingId);
  }, []);

  const closeRatingDrawer = useCallback(() => {
    setRatingDrawerBookingId(null);
  }, []);

  const handleRatingSubmitted = useCallback(async () => {
    await refreshPending();
    closeRatingDrawer();
  }, [refreshPending, closeRatingDrawer]);

  const pendingBookingIds = useMemo(
    () => new Set(pendingAlerts.map((a) => a.bookingId)),
    [pendingAlerts]
  );

  const value = useMemo(
    () => ({
      pendingAlerts,
      pendingCount,
      pendingBookingIds,
      loadingPending,
      refreshPending,
      openRatingDrawer,
      closeRatingDrawer,
      ratingDrawerBookingId,
    }),
    [
      pendingAlerts,
      pendingCount,
      pendingBookingIds,
      loadingPending,
      refreshPending,
      openRatingDrawer,
      closeRatingDrawer,
      ratingDrawerBookingId,
    ]
  );

  return (
    <CompanyRatingContext.Provider value={value}>
      {children}
      <CompanyTrainerRatingDrawer
        bookingId={ratingDrawerBookingId}
        onClose={closeRatingDrawer}
        onSubmitted={handleRatingSubmitted}
      />
    </CompanyRatingContext.Provider>
  );
}

/**
 * Access company rating alerts and drawer actions.
 *
 * @returns Rating context value.
 */
export function useCompanyRating(): CompanyRatingContextValue {
  const ctx = useContext(CompanyRatingContext);
  if (!ctx) {
    throw new Error("useCompanyRating must be used within CompanyRatingProvider");
  }
  return ctx;
}

/**
 * Safe hook that returns null outside provider (for optional integrations).
 */
export function useCompanyRatingOptional(): CompanyRatingContextValue | null {
  return useContext(CompanyRatingContext);
}
