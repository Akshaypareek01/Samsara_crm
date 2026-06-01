"use client";

import { useCallback, useEffect, useState } from "react";
import bookingService, { Booking } from "@/services/bookingService";

export interface TrainerKpis {
    totalBookings: number;
    upcomingSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    hoursDelivered: number;
    completionRate: number;
}

export interface TrainerChartData {
    /** Last 6 month labels e.g. ["Jan", "Feb", ...] */
    trendLabels: string[];
    /** Booking counts aligned to trendLabels */
    trendCounts: number[];
    /** Status donut: ordered labels + values */
    statusLabels: string[];
    statusValues: number[];
    /** Top training programs: labels + counts */
    trainingLabels: string[];
    trainingCounts: number[];
}

export interface TrainerDashboardStats {
    kpis: TrainerKpis;
    charts: TrainerChartData;
    loading: boolean;
    error: string;
    refetch: () => void;
}

const EMPTY_KPIS: TrainerKpis = {
    totalBookings: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    hoursDelivered: 0,
    completionRate: 0,
};

const EMPTY_CHARTS: TrainerChartData = {
    trendLabels: [],
    trendCounts: [],
    statusLabels: [],
    statusValues: [],
    trainingLabels: [],
    trainingCounts: [],
};

const STATUS_ORDER = ["approved", "confirmed", "completed", "cancelled"] as const;
const STATUS_LABELS: Record<string, string> = {
    approved: "Pending Admin",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    pending_approval: "Pending Trainer",
    rejected: "Rejected",
};

/**
 * Builds the trailing six-month buckets used for the booking trend chart.
 * @returns Ordered list of `{ label, key }` from five months ago to now.
 */
const buildMonthBuckets = (): { label: string; key: string }[] => {
    const buckets: { label: string; key: string }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({
            label: d.toLocaleDateString("en-US", { month: "short" }),
            key: `${d.getFullYear()}-${d.getMonth()}`,
        });
    }
    return buckets;
};

/**
 * Aggregates a trainer's bookings into KPI counters and chart-ready datasets.
 * @param bookings - Raw bookings for the authenticated trainer.
 */
const computeStats = (
    bookings: Booking[],
    totalResults: number
): { kpis: TrainerKpis; charts: TrainerChartData } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let completed = 0;
    let cancelled = 0;
    let upcoming = 0;
    let hours = 0;

    const statusCount: Record<string, number> = {};
    const trainingCount: Record<string, number> = {};
    const monthBuckets = buildMonthBuckets();
    const monthMap = new Map<string, number>(monthBuckets.map((b) => [b.key, 0]));

    bookings.forEach((b) => {
        statusCount[b.status] = (statusCount[b.status] || 0) + 1;

        if (b.status === "completed") {
            completed += 1;
            hours += Number(b.duration) || 0;
        }
        if (b.status === "cancelled") cancelled += 1;

        const bookingDate = b.bookingDate ? new Date(b.bookingDate) : null;
        if (
            bookingDate &&
            bookingDate >= today &&
            (b.status === "pending_approval" || b.status === "approved" || b.status === "confirmed")
        ) {
            upcoming += 1;
        }

        const refDate = b.bookingDate || b.createdAt;
        if (refDate) {
            const d = new Date(refDate);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) || 0) + 1);
        }

        (b.typeOfTraining || []).forEach((t) => {
            trainingCount[t] = (trainingCount[t] || 0) + 1;
        });
    });

    const total = totalResults || bookings.length;

    const statusLabels: string[] = [];
    const statusValues: number[] = [];
    STATUS_ORDER.forEach((s) => {
        if (statusCount[s]) {
            statusLabels.push(STATUS_LABELS[s] || s);
            statusValues.push(statusCount[s]);
        }
    });

    const topTraining = Object.entries(trainingCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    return {
        kpis: {
            totalBookings: total,
            upcomingSessions: upcoming,
            completedSessions: completed,
            cancelledSessions: cancelled,
            hoursDelivered: Math.round(hours * 10) / 10,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        },
        charts: {
            trendLabels: monthBuckets.map((b) => b.label),
            trendCounts: monthBuckets.map((b) => monthMap.get(b.key) || 0),
            statusLabels,
            statusValues,
            trainingLabels: topTraining.map(([label]) => label),
            trainingCounts: topTraining.map(([, count]) => count),
        },
    };
};

/**
 * Loads the authenticated trainer's bookings and derives KPIs + chart datasets
 * for the dashboard analytics view.
 */
export function useTrainerDashboardStats(): TrainerDashboardStats {
    const [kpis, setKpis] = useState<TrainerKpis>(EMPTY_KPIS);
    const [charts, setCharts] = useState<TrainerChartData>(EMPTY_CHARTS);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await bookingService.getMyBookings({
                page: 1,
                limit: 200,
                sortBy: "createdAt:desc",
            });
            const { kpis: k, charts: c } = computeStats(
                response.results || [],
                response.totalResults || 0
            );
            setKpis(k);
            setCharts(c);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to load dashboard analytics";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    return { kpis, charts, loading, error, refetch: load };
}
