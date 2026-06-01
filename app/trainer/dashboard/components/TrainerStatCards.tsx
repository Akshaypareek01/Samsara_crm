"use client";
import React from "react";
import type { TrainerKpis } from "@/hooks/useTrainerDashboardStats";

interface StatCardConfig {
    label: string;
    value: string | number;
    hint: string;
    icon: string;
    iconColor: string;
    iconBg: string;
}

interface TrainerStatCardsProps {
    kpis: TrainerKpis;
    loading: boolean;
}

/**
 * KPI summary cards for the trainer dashboard (bookings, sessions, hours, completion).
 *
 * @param kpis - Computed booking metrics.
 * @param loading - Whether the underlying data is still loading.
 */
const TrainerStatCards: React.FC<TrainerStatCardsProps> = ({ kpis, loading }) => {
    const dash = (v: string | number) => (loading ? "—" : v);

    const cards: StatCardConfig[] = [
        {
            label: "Total Bookings",
            value: dash(kpis.totalBookings),
            hint: "All-time requests",
            icon: "bx bx-calendar",
            iconColor: "#6366F1",
            iconBg: "#EEF2FF",
        },
        {
            label: "Upcoming Sessions",
            value: dash(kpis.upcomingSessions),
            hint: "Pending accept or confirmed",
            icon: "bx bx-time-five",
            iconColor: "#0EA5E9",
            iconBg: "#E0F2FE",
        },
        {
            label: "Completed",
            value: dash(kpis.completedSessions),
            hint: `${loading ? "—" : kpis.completionRate}% completion rate`,
            icon: "bx bx-check-circle",
            iconColor: "#10B981",
            iconBg: "#D1FAE5",
        },
        {
            label: "Hours Delivered",
            value: loading ? "—" : `${kpis.hoursDelivered}h`,
            hint: "From completed sessions",
            icon: "bx bx-bar-chart-alt-2",
            iconColor: "#EAB308",
            iconBg: "#FEF9C3",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {cards.map((card) => (
                <div className="box mb-0" key={card.label}>
                    <div className="box-body p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-muted mb-1">{card.label}</p>
                                <p className="text-3xl font-bold text-defaulttextcolor">{card.value}</p>
                                <p className="text-[0.7rem] text-muted mt-1">{card.hint}</p>
                            </div>
                            <div
                                className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: card.iconBg }}
                            >
                                <i className={`${card.icon} text-xl`} style={{ color: card.iconColor }}></i>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TrainerStatCards;
