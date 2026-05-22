"use client";

import React, { useCallback, useEffect, useState } from "react";
import CompanyBookingsList from "../components/CompanyBookingsList";
import CompanyBookingsMonthDashboard, {
    currentYearMonth,
    shiftYearMonth,
} from "./CompanyBookingsMonthDashboard";
import bookingService, { MyBookingsSummary } from "@/services/bookingService";

const BookingsPage: React.FC = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [monthKey, setMonthKey] = useState(currentYearMonth);
    const [summary, setSummary] = useState<MyBookingsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        void loadSummary();
    }, [loadSummary]);

    const bumpList = () => {
        setRefreshTrigger((n) => n + 1);
        void loadSummary();
    };

    const canGoNextMonth = monthKey < currentYearMonth();

    return (
        <div>
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
            />
            <div id="company-bookings-list" className="grid grid-cols-12 gap-6">
                <div className="xl:col-span-12 col-span-12">
                    <CompanyBookingsList refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
};

export default BookingsPage;
