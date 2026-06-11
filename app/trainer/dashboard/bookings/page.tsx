"use client";

import React, { Fragment, useCallback, useEffect, useState } from "react";
import Pageheader from "@/shared/layout-components/page-header/pageheader";
import Seo from "@/shared/layout-components/seo/seo";
import TrainerBookingsList from "../components/TrainerBookingsList";
import TrainerBookingsCalendarView from "./TrainerBookingsCalendarView";
import bookingService, { MyBookingsSummary } from "@/services/bookingService";
import {
    currentYearMonth,
    maxYearMonth,
    shiftYearMonth,
} from "@/shared/utils/bookingsCalendarUtils";

type BookingsView = "calendar" | "table";

const BookingsPage: React.FC = () => {
    const [view, setView] = useState<BookingsView>("calendar");
    const [monthKey, setMonthKey] = useState(currentYearMonth);
    const [summary, setSummary] = useState<MyBookingsSummary | null>(null);
    const [summaryLoading, setSummaryLoading] = useState(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const loadSummary = useCallback(async () => {
        try {
            setSummaryLoading(true);
            setSummaryError(null);
            const data = await bookingService.getMyBookingsSummary(monthKey);
            setSummary(data);
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "Failed to load booking summary";
            setSummaryError(message);
            setSummary(null);
        } finally {
            setSummaryLoading(false);
        }
    }, [monthKey]);

    useEffect(() => {
        if (view === "calendar") {
            void loadSummary();
        }
    }, [loadSummary, view]);

    const bumpRefresh = () => {
        setRefreshTrigger((n) => n + 1);
        void loadSummary();
    };

    const canGoNextMonth = monthKey < maxYearMonth();

    return (
        <Fragment>
            <Seo title={"My Bookings"} />
            <Pageheader currentpage="Bookings" activepage="Trainer" mainpage="Bookings" />

            <div className="box mb-4">
                <div className="box-body py-3">
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
                </div>
            </div>

            {view === "calendar" ? (
                <TrainerBookingsCalendarView
                    summary={summary}
                    loading={summaryLoading}
                    error={summaryError}
                    monthKey={monthKey}
                    onPrevMonth={() => setMonthKey((m) => shiftYearMonth(m, -1))}
                    onNextMonth={() => {
                        if (canGoNextMonth) setMonthKey((m) => shiftYearMonth(m, 1));
                    }}
                    nextMonthDisabled={!canGoNextMonth}
                    onRetrySummary={() => void loadSummary()}
                    onRefresh={bumpRefresh}
                />
            ) : (
                <div className="grid grid-cols-12 gap-6">
                    <div className="xl:col-span-12 col-span-12">
                        <TrainerBookingsList refreshTrigger={refreshTrigger} />
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default BookingsPage;
