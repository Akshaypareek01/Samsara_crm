"use client";

import React, { useMemo, useState } from "react";
import type {
    MyBookingsSummary,
    MyBookingsSummaryClassRow,
    MyBookingsSummaryTrainerAvail,
} from "@/services/bookingService";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const QUICK_ACTIONS = [
    {
        icon: "bx-calendar-check",
        iconBg: "#EEF2FF",
        iconColor: "#6366F1",
        title: "Today's Schedule",
        sub: "Scroll to booking list",
        action: "scroll-list" as const,
    },
    {
        icon: "bx-time-five",
        iconBg: "#FEF9C3",
        iconColor: "#CA8A04",
        title: "Pending approvals",
        sub: "Admin queue",
        action: "none" as const,
    },
    {
        icon: "bx-envelope",
        iconBg: "#D1FAE5",
        iconColor: "#059669",
        title: "Confirmations",
        sub: "Email handled after approval",
        action: "none" as const,
    },
    {
        icon: "bx-user-check",
        iconBg: "#FCE7F3",
        iconColor: "#EC4899",
        title: "Trainer availability",
        sub: "Unique trainers this month",
        action: "none" as const,
    },
];

const STATUS_STYLE: Record<string, string> = {
    Active: "bg-success/15 text-success",
    "Nearly Full": "bg-warning/15 text-warning",
    Full: "bg-danger/15 text-danger",
};

const AVAIL_STYLE: Record<string, string> = {
    Available: "bg-success/15 text-success",
    Unavailable: "bg-danger/15 text-danger",
    "In Session": "bg-warning/15 text-warning",
    "On Leave": "text-muted",
};

export interface CalendarMeta {
    year: number;
    monthIndex: number;
    daysInMonth: number;
    startDow: number;
    todayDay: number | null;
    monthLabel: string;
}

/**
 * Build calendar metadata for the bookings grid.
 *
 * @param year - Full year
 * @param monthIndex - 0-based month
 */
export function buildCalendarMeta(year: number, monthIndex: number): CalendarMeta {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const startDow = new Date(year, monthIndex, 1).getDay();
    const now = new Date();
    const todayDay =
        now.getFullYear() === year && now.getMonth() === monthIndex ? now.getDate() : null;
    const monthLabel = new Date(year, monthIndex, 1).toLocaleString(undefined, {
        month: "long",
        year: "numeric",
    });
    return { year, monthIndex, daysInMonth, startDow, todayDay, monthLabel };
}

/**
 * Parse `YYYY-MM` into year and month index.
 *
 * @param ym - Month key
 */
export function parseYearMonth(ym: string): { year: number; monthIndex: number } {
    const [y, m] = ym.split("-").map((n) => parseInt(n, 10));
    return { year: y, monthIndex: m - 1 };
}

/**
 * Add months to a YYYY-MM key.
 *
 * @param ym - Current month
 * @param delta - Months to add (can be negative)
 */
export function shiftYearMonth(ym: string, delta: number): string {
    const { year, monthIndex } = parseYearMonth(ym);
    const d = new Date(year, monthIndex + delta, 1);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
}

export function currentYearMonth(): string {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${d.getFullYear()}-${mm}`;
}

type Props = {
    summary: MyBookingsSummary | null;
    loading: boolean;
    error: string | null;
    monthKey: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    onRefreshList: () => void;
};

/**
 * Bookings dashboard sections driven by GET /bookings/my-bookings/summary.
 */
const CompanyBookingsMonthDashboard: React.FC<Props> = ({
    summary,
    loading,
    error,
    monthKey,
    onPrevMonth,
    onNextMonth,
    onRefreshList,
}) => {
    const [classSearch, setClassSearch] = useState("");

    const cal = useMemo(() => {
        const { year, monthIndex } = parseYearMonth(monthKey);
        return buildCalendarMeta(year, monthIndex);
    }, [monthKey]);

    const filteredClasses = useMemo(() => {
        const rows: MyBookingsSummaryClassRow[] = summary?.classSchedule || [];
        return rows.filter(
            (c) =>
                classSearch === "" ||
                c.classType.toLowerCase().includes(classSearch.toLowerCase()) ||
                c.trainerName.toLowerCase().includes(classSearch.toLowerCase())
        );
    }, [summary, classSearch]);

    const calendarDots = summary?.calendarDots || {};
    const highlightedDays = useMemo(
        () => Object.keys(calendarDots).map((k) => Number(k)),
        [calendarDots]
    );

    const leadingBlanks = cal.startDow;
    const totalCells = Math.ceil((leadingBlanks + cal.daysInMonth) / 7) * 7;

    const totals = summary?.totals;

    const scrollToList = () => {
        const el = document.getElementById("company-bookings-list");
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div>
            <h5 className="font-bold text-xl text-defaulttextcolor mb-5">Booking Management</h5>

            {error && (
                <div className="alert alert-danger mb-4" role="alert">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                <div className="box mb-0">
                    <div className="box-body p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted mb-1">Total Bookings</p>
                            <p className="text-3xl font-bold text-defaulttextcolor">
                                {loading ? "…" : totals?.totalBookings ?? 0}
                            </p>
                        </div>
                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#EEF2FF" }}
                        >
                            <i className="bx bx-calendar text-xl" style={{ color: "#6366F1" }}></i>
                        </div>
                    </div>
                </div>
                <div className="box mb-0">
                    <div className="box-body p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted mb-1">Active Reservations</p>
                            <p className="text-3xl font-bold text-defaulttextcolor">
                                {loading ? "…" : totals?.activeReservations ?? 0}
                            </p>
                        </div>
                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#D1FAE5" }}
                        >
                            <i className="bx bx-check-circle text-xl" style={{ color: "#10B981" }}></i>
                        </div>
                    </div>
                </div>
                <div className="box mb-0">
                    <div className="box-body p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted mb-1">Pending approval</p>
                            <p className="text-3xl font-bold text-defaulttextcolor">
                                {loading ? "…" : totals?.waitingList ?? 0}
                            </p>
                        </div>
                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#FEF9C3" }}
                        >
                            <i className="bx bx-time-five text-xl" style={{ color: "#CA8A04" }}></i>
                        </div>
                    </div>
                </div>
                <div className="box mb-0">
                    <div className="box-body p-5 flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted mb-1">Occupancy (active / total)</p>
                            <p className="text-3xl font-bold text-defaulttextcolor">
                                {loading ? "…" : totals?.occupancyRate ?? "—"}
                            </p>
                        </div>
                        <div
                            className="w-11 h-11 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: "#F3E8FF" }}
                        >
                            <i className="bx bx-pie-chart-alt-2 text-xl" style={{ color: "#9B59B6" }}></i>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mb-6">
                <div className="xl:col-span-8 col-span-12 box mb-0">
                    <div className="box-header flex items-center justify-between">
                        <h6 className="box-title font-bold !mb-0">Booking Calendar</h6>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onPrevMonth}
                                className="w-7 h-7 rounded-full hover:bg-light flex items-center justify-center text-muted"
                                aria-label="Previous month"
                            >
                                <i className="bx bx-chevron-left text-lg"></i>
                            </button>
                            <span className="text-sm font-semibold text-defaulttextcolor">
                                {cal.monthLabel}
                            </span>
                            <button
                                type="button"
                                onClick={onNextMonth}
                                className="w-7 h-7 rounded-full hover:bg-light flex items-center justify-center text-muted"
                                aria-label="Next month"
                            >
                                <i className="bx bx-chevron-right text-lg"></i>
                            </button>
                        </div>
                    </div>
                    <div className="box-body pt-0">
                        <div className="grid grid-cols-7 mb-1">
                            {DAYS_OF_WEEK.map((d) => (
                                <div key={d} className="text-center text-xs font-semibold text-muted py-2">
                                    {d}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: totalCells }).map((_, idx) => {
                                const day = idx - leadingBlanks + 1;
                                const isValid = day >= 1 && day <= cal.daysInMonth;
                                const isToday = cal.todayDay != null && day === cal.todayDay;
                                const isHighlight = highlightedDays.includes(day);
                                const dots = calendarDots[day] ?? [];

                                return (
                                    <div
                                        key={idx}
                                        className={`relative min-h-[52px] rounded-lg p-1.5 flex flex-col ${
                                            !isValid
                                                ? ""
                                                : isToday
                                                  ? "border-2 border-primary"
                                                  : isHighlight
                                                    ? "bg-warning/10"
                                                    : ""
                                        }`}
                                    >
                                        {isValid && (
                                            <>
                                                <span
                                                    className={`text-xs font-semibold ${
                                                        isToday ? "text-primary" : "text-defaulttextcolor"
                                                    }`}
                                                >
                                                    {day}
                                                </span>
                                                {dots.length > 0 && (
                                                    <div className="flex gap-0.5 flex-wrap mt-auto">
                                                        {dots.map((color, i) => (
                                                            <span
                                                                key={i}
                                                                className="w-1.5 h-1.5 rounded-full"
                                                                style={{ backgroundColor: color }}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <div className="flex items-center gap-4 flex-wrap mt-4 pt-3 border-t border-defaultborder">
                            {[
                                { label: "Group Classes", color: "#EF4444" },
                                { label: "Private Classes", color: "#3B82F6" },
                                { label: "Workshops", color: "#22C55E" },
                                { label: "Special Events", color: "#F97316" },
                            ].map((l) => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                                    <span className="text-xs text-muted">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-4 col-span-12 flex flex-col gap-4">
                    <div className="box mb-0">
                        <div className="box-header">
                            <h6 className="box-title font-bold !mb-0">Quick Actions</h6>
                        </div>
                        <div className="box-body flex flex-col gap-2 pt-0">
                            {QUICK_ACTIONS.map((qa) => (
                                <button
                                    key={qa.title}
                                    type="button"
                                    onClick={() => {
                                        if (qa.action === "scroll-list") scrollToList();
                                        if (qa.action === "scroll-list") onRefreshList();
                                    }}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-defaultborder hover:bg-light transition-colors text-left w-full"
                                >
                                    <div
                                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: qa.iconBg }}
                                    >
                                        <i
                                            className={`bx ${qa.icon} text-base`}
                                            style={{ color: qa.iconColor }}
                                        ></i>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-defaulttextcolor leading-tight">
                                            {qa.title}
                                        </p>
                                        <p className="text-xs text-muted">{qa.sub}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="box mb-0">
                        <div className="box-header">
                            <h6 className="box-title font-bold !mb-0">Recent Activities</h6>
                        </div>
                        <div className="box-body flex flex-col gap-4 pt-0">
                            {loading && (
                                <p className="text-xs text-muted mb-0">Loading…</p>
                            )}
                            {!loading && (summary?.recentActivities?.length || 0) === 0 && (
                                <p className="text-xs text-muted mb-0">No recent booking updates.</p>
                            )}
                            {(summary?.recentActivities || []).map((a, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <span
                                        className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                                        style={{ backgroundColor: a.color }}
                                    />
                                    <div>
                                        <p className="text-sm font-semibold text-defaulttextcolor leading-tight">
                                            {a.title}
                                        </p>
                                        <p className="text-xs text-muted">{a.sub}</p>
                                        <p className="text-xs text-muted mt-0.5">{a.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="box mb-6">
                <div className="box-header flex items-center justify-between flex-wrap gap-3">
                    <h6 className="box-title font-bold !mb-0">Class Schedule Management</h6>
                    <div className="flex items-center gap-2">
                        <div className="relative" style={{ minWidth: "200px" }}>
                            <i
                                className="bx bx-search absolute top-1/2 -translate-y-1/2 text-muted text-sm"
                                style={{ left: "10px" }}
                            ></i>
                            <input
                                type="search"
                                placeholder="Search classes..."
                                value={classSearch}
                                onChange={(e) => setClassSearch(e.target.value)}
                                className="ti-form-control !text-[0.875rem]"
                                style={{ paddingLeft: "32px" }}
                                aria-label="Search schedule"
                            />
                        </div>
                    </div>
                </div>
                <div className="box-body p-0">
                    <div className="table-responsive w-full">
                        <table className="table w-full text-sm whitespace-nowrap mb-0">
                            <thead>
                                <tr className="border-b border-defaultborder bg-light/40">
                                    {[
                                        "Date & Time",
                                        "Class Type",
                                        "Trainer",
                                        "Capacity",
                                        "Booked",
                                        "Waiting List",
                                        "Status",
                                    ].map((h) => (
                                        <th key={h} className="font-semibold text-muted text-xs py-3 px-4">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClasses.map((row, i) => (
                                    <tr key={i} className="border-b border-defaultborder/50 hover:bg-light/50">
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-sm text-defaulttextcolor mb-0">
                                                {row.dateLabel}
                                            </p>
                                            <p className="text-xs text-muted mb-0">{row.dateSubLabel}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: row.dotColor }}
                                                />
                                                <span className="text-sm text-defaulttextcolor">{row.classType}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                    style={{ backgroundColor: row.trainerBg, color: "#374151" }}
                                                >
                                                    {row.trainerInitials}
                                                </div>
                                                <span className="text-sm text-defaulttextcolor">{row.trainerName}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-defaulttextcolor">{row.capacity}</td>
                                        <td className="py-3 px-4 text-sm text-defaulttextcolor">{row.booked}</td>
                                        <td className="py-3 px-4 text-sm text-defaulttextcolor">{row.waitingList}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`px-2.5 py-0.5 rounded text-xs font-semibold ${STATUS_STYLE[row.status] || STATUS_STYLE.Active}`}
                                            >
                                                {row.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {filteredClasses.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-muted text-sm">
                                            No sessions in this month.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-4 mb-6">
                <div className="xl:col-span-5 col-span-12 box mb-0">
                    <div className="box-header flex items-center justify-between">
                        <h6 className="box-title font-bold !mb-0">Trainers this month</h6>
                    </div>
                    <div className="box-body flex flex-col gap-3 pt-0">
                        {(summary?.trainerAvailability || []).length === 0 && !loading && (
                            <p className="text-xs text-muted mb-0">No trainers in bookings for this month.</p>
                        )}
                        {(summary?.trainerAvailability || []).map((t: MyBookingsSummaryTrainerAvail) => (
                            <div key={t.name} className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                                    style={{ backgroundColor: t.avatarBg, color: "#374151" }}
                                >
                                    {t.initials}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-defaulttextcolor leading-tight mb-0">
                                        {t.name}
                                    </p>
                                    <p className="text-xs text-muted mb-0">{t.speciality}</p>
                                </div>
                                <span
                                    className={`text-xs font-semibold ${AVAIL_STYLE[t.status] || AVAIL_STYLE.Available}`}
                                >
                                    {t.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="xl:col-span-7 col-span-12 box mb-0">
                    <div className="box-header flex items-center justify-between">
                        <h6 className="box-title font-bold !mb-0">Waiting list (pending approval)</h6>
                    </div>
                    <div className="box-body flex flex-col gap-5 pt-0">
                        {!loading && (summary?.waitingListGroups?.length || 0) === 0 && (
                            <p className="text-xs text-muted mb-0">No pending approvals.</p>
                        )}
                        {(summary?.waitingListGroups || []).map((group) => (
                            <div key={group.title}>
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-semibold text-defaulttextcolor">{group.title}</p>
                                    <span className="text-xs font-semibold text-danger">{group.count} waiting</span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    {group.people.map((person, i) => (
                                        <div key={`${person}-${i}`} className="flex items-center gap-2">
                                            <span className="text-xs text-muted w-4">{i + 1}.</span>
                                            <span className="text-sm text-defaulttextcolor">{person}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyBookingsMonthDashboard;
