"use client";

import { useEffect, useState } from "react";
import TrainerService from "@/services/trainerService";
import bookingService from "@/services/bookingService";
import companyService from "@/services/companyService";

export interface CompanyTrainerStats {
    totalTrainers: number;
    activeTrainers: number;
    companyBookings: number;
    completionPct: number;
    loading: boolean;
    error: string;
}

import { COMPANY_DATA_BUST_EVENT } from "@/services/companyInsightsClient";

const initial: CompanyTrainerStats = {
    totalTrainers: 0,
    activeTrainers: 0,
    companyBookings: 0,
    completionPct: 0,
    loading: true,
    error: "",
};

type TrainerStatsPeriod = "Weekly" | "Monthly" | "Quarterly" | "Yearly";

/**
 * Loads catalog trainer counts, company booking total, and completion % from dashboard overview.
 *
 * @param period - Optional analytics window passed to dashboard overview API
 */
export function useCompanyTrainerStats(period?: TrainerStatsPeriod): CompanyTrainerStats {
    const [state, setState] = useState<CompanyTrainerStats>(initial);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setState((s) => ({ ...s, loading: true, error: "" }));
                const [catalog, active, bookings, overview] = await Promise.all([
                    TrainerService.getTrainers({
                        status: true,
                        acceptingBookings: true,
                        page: 1,
                        limit: 1,
                        sortBy: "createdAt:desc",
                    }),
                    TrainerService.getTrainers({
                        status: true,
                        acceptingBookings: true,
                        page: 1,
                        limit: 1,
                        sortBy: "createdAt:desc",
                    }),
                    bookingService.getMyBookings({ page: 1, limit: 1, sortBy: "createdAt:desc" }),
                    companyService.getDashboardOverview(period),
                ]);
                if (cancelled) return;
                const ao = overview?.analyticsOverview as
                    | { completionRate?: { value?: number } }
                    | undefined;
                const completionPct = Number(ao?.completionRate?.value ?? 0);
                setState({
                    totalTrainers: catalog.totalResults ?? 0,
                    activeTrainers: active.totalResults ?? 0,
                    companyBookings: bookings.totalResults ?? 0,
                    completionPct: Number.isFinite(completionPct) ? completionPct : 0,
                    loading: false,
                    error: "",
                });
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Failed to load trainer analytics";
                if (!cancelled) {
                    setState((s) => ({ ...s, loading: false, error: msg }));
                }
            }
        };

        void load();
        const onBust = () => {
            void load();
        };
        if (typeof window !== "undefined") {
            window.addEventListener(COMPANY_DATA_BUST_EVENT, onBust);
        }
        return () => {
            cancelled = true;
            if (typeof window !== "undefined") {
                window.removeEventListener(COMPANY_DATA_BUST_EVENT, onBust);
            }
        };
    }, [period]);

    return state;
}
