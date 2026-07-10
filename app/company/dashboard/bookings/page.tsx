"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CompanyBookingsList from "../components/CompanyBookingsList";
import CompanyBookingsMonthDashboard from "./CompanyBookingsMonthDashboard";
import { bookingNewPageUrl } from "../utils/bookingPageUrl";
import { currentYearMonth, maxYearMonth, shiftYearMonth } from "@/shared/utils/bookingsCalendarUtils";
import bookingService, { MyBookingsSummary } from "@/services/bookingService";

type BookingsView = "calendar" | "table";

const BookingsPage: React.FC = () => {
    const router = useRouter();
    const [view, setView] = useState<BookingsView>("calendar");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [monthKey, setMonthKey] = useState(currentYearMonth);
    const [summary, setSummary] = useState<MyBookingsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const openNewBooking = () => {
        router.push(bookingNewPageUrl(undefined, "/company/dashboard/bookings"));
    };

    const loadSummary = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await bookingService.getMyBookingsSummary(monthKey);
            setSummary(data);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to load booking summary";
            setError(message);
            setSummary(null);
        } finally {
            setLoading(false);
        }
    }, [monthKey]);

    useEffect(() => {
        if (view === "calendar") {
            void loadSummary();
        }
    }, [loadSummary, view]);

    const bumpList = () => {
        setRefreshTrigger((n) => n + 1);
        void loadSummary();
    };

    const canGoNextMonth = monthKey < maxYearMonth();

    return (
        <div>
            <div className="box mb-4">
                <div className="box-body py-3 flex flex-wrap items-center justify-between gap-3">
                    <div
                        className="inline-flex rounded-lg border border-defaultborder p-1 bg-light/40"
                        role="tablist"
                        aria-label="Bookings view"
                    >
                        <button
                            type="button"
                            role="tab"
                            aria-selected={view === "calendar"}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                view === "calendar"
                                    ? "bg-white dark:bg-bodybg text-primary shadow-sm"
                                    : "text-muted hover:text-defaulttextcolor"
                            }`}
                            onClick={() => setView("calendar")}
                        >
                            <i className="ri-calendar-line me-1" aria-hidden="true"></i>
                            Calendar
                        </button>
                        <button
                            type="button"
                            role="tab"
                            aria-selected={view === "table"}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                                view === "table"
                                    ? "bg-white dark:bg-bodybg text-primary shadow-sm"
                                    : "text-muted hover:text-defaulttextcolor"
                            }`}
                            onClick={() => setView("table")}
                        >
                            <i className="ri-table-line me-1" aria-hidden="true"></i>
                            Table
                        </button>
                    </div>
                    <button
                        type="button"
                        className="ti-btn ti-btn-primary !m-0"
                        onClick={openNewBooking}
                        aria-label="Create new multi-session booking"
                    >
                        <i className="ri-add-line me-1" aria-hidden="true" />
                        New booking
                    </button>
                </div>
            </div>

            {view === "calendar" ? (
                <CompanyBookingsMonthDashboard
                    summary={summary}
                    loading={loading}
                    error={error}
                    monthKey={monthKey}
                    onPrevMonth={() => setMonthKey((m) => shiftYearMonth(m, -1))}
                    onNextMonth={() => {
                        if (canGoNextMonth) {
                            setMonthKey((m) => shiftYearMonth(m, 1));
                        }
                    }}
                    nextMonthDisabled={!canGoNextMonth}
                    onRetrySummary={() => void loadSummary()}
                    onRefreshList={bumpList}
                    onOpenTableView={() => setView("table")}
                    onNewBooking={openNewBooking}
                />
            ) : (
                <div id="company-bookings-list" className="grid grid-cols-12 gap-6">
                    <div className="xl:col-span-12 col-span-12">
                        <CompanyBookingsList refreshTrigger={refreshTrigger} onBookingChanged={bumpList} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookingsPage;
