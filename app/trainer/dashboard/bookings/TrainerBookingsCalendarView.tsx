"use client";

import React, { useMemo, useState } from "react";
import bookingService, {
    Booking,
    MyBookingsSummary,
    MyBookingsSummaryDayBooking,
} from "@/services/bookingService";
import StatusBadge from "@/shared/components/StatusBadge";
import {
    buildCalendarMeta,
    parseYearMonth,
    toIsoDateInMonth,
} from "@/shared/utils/bookingsCalendarUtils";
import {
    canCancelBooking,
    canCompleteBooking,
    canConfirmBooking,
    formatBookingTime,
} from "@/shared/utils/bookingUtils";
import Swal from "sweetalert2";
import TrainerBookingDetailsDrawer from "../components/TrainerBookingDetailsDrawer";

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const STATUS_DOT: Record<string, string> = {
    confirmed: "#22C55E",
    approved: "#3B82F6",
    completed: "#6366F1",
    pending_approval: "#F59E0B",
    cancelled: "#9CA3AF",
    rejected: "#EF4444",
};

type DayActionVariant = "info" | "success" | "primary" | "danger";

const DAY_ACTION_STYLES: Record<DayActionVariant, string> = {
    info: "bg-info/10 text-info hover:bg-info/20",
    success: "bg-success/10 text-success hover:bg-success/20",
    primary: "bg-primary/10 text-primary hover:bg-primary/20",
    danger: "bg-danger/10 text-danger hover:bg-danger/20",
};

type DayActionConfig = {
    id: string;
    variant: DayActionVariant;
    label: string;
    icon: string;
    onClick: () => void;
    disabled?: boolean;
};

type BookingDayActionsProps = {
    actions: DayActionConfig[];
};

/**
 * Grid of day-panel booking actions (no floated ti-btn styles).
 */
const BookingDayActions: React.FC<BookingDayActionsProps> = ({ actions }) => {
    if (actions.length === 0) return null;

    const gridClass =
        actions.length === 1
            ? "grid-cols-1"
            : actions.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-2";

    return (
        <div className={`grid ${gridClass} gap-2`} role="group" aria-label="Booking actions">
            {actions.map((action) => (
                <button
                    key={action.id}
                    type="button"
                    disabled={action.disabled}
                    onClick={action.onClick}
                    className={`!m-0 !float-none w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap rounded-lg border border-defaultborder dark:border-white/10 transition-colors min-h-[2.25rem] disabled:opacity-50 disabled:pointer-events-none ${DAY_ACTION_STYLES[action.variant]}`}
                >
                    <i className={`${action.icon} text-sm leading-none`} aria-hidden="true"></i>
                    {action.label}
                </button>
            ))}
        </div>
    );
};

type Props = {
    summary: MyBookingsSummary | null;
    loading: boolean;
    error: string | null;
    monthKey: string;
    onPrevMonth: () => void;
    onNextMonth: () => void;
    nextMonthDisabled?: boolean;
    onRetrySummary?: () => void;
    onRefresh: () => void;
};

/**
 * Month calendar for trainer bookings with day selection and session actions.
 */
const TrainerBookingsCalendarView: React.FC<Props> = ({
    summary,
    loading,
    error,
    monthKey,
    onPrevMonth,
    onNextMonth,
    nextMonthDisabled = false,
    onRetrySummary,
    onRefresh,
}) => {
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [trainerNotes, setTrainerNotes] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const cal = useMemo(() => {
        const { year, monthIndex } = parseYearMonth(monthKey);
        return buildCalendarMeta(year, monthIndex);
    }, [monthKey]);

    const calendarDays = summary?.calendarDays ?? {};
    const totals = summary?.totals;

    const leadingBlanks = cal.startDow;
    const totalCells = Math.ceil((leadingBlanks + cal.daysInMonth) / 7) * 7;

    const selectedDayBookings: MyBookingsSummaryDayBooking[] =
        selectedDay != null ? calendarDays[selectedDay] ?? [] : [];

    const formatDateLabel = (day: number) => {
        const iso = toIsoDateInMonth(monthKey, day);
        return new Date(iso + "T12:00:00").toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    /**
     * Loads full booking for confirm/complete modals.
     *
     * @param snippet - Summary row from calendar day.
     */
    /**
     * Opens the booking details drawer with full company profile.
     *
     * @param bookingId - Booking Mongo id.
     */
    const openBookingView = async (bookingId: string) => {
        setDrawerOpen(true);
        setDrawerLoading(true);
        try {
            const full = await bookingService.getBookingById(bookingId);
            setSelectedBooking(full);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Could not load booking";
            void Swal.fire({ icon: "error", title: "Error", text: msg });
            setDrawerOpen(false);
        } finally {
            setDrawerLoading(false);
        }
    };

    const openBookingAction = async (snippet: MyBookingsSummaryDayBooking, mode: "confirm" | "complete") => {
        try {
            setActionLoading(true);
            const full = await bookingService.getBookingById(snippet.id);
            setSelectedBooking(full);
            setTrainerNotes("");
            if (mode === "confirm") setShowConfirmModal(true);
            else setShowCompleteModal(true);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Could not load booking";
            void Swal.fire({ icon: "error", title: "Error", text: msg });
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedBooking) return;
        try {
            await bookingService.updateBookingStatus(selectedBooking._id || selectedBooking.id || "", {
                status: "approved",
                trainerNotes,
            });
            void Swal.fire("Accepted!", "Booking accepted. Awaiting admin approval.", "success");
            setShowConfirmModal(false);
            setDrawerOpen(false);
            setTrainerNotes("");
            onRefresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to accept booking";
            void Swal.fire("Error", msg, "error");
        }
    };

    const handleCompleteBooking = async () => {
        if (!selectedBooking) return;
        try {
            await bookingService.updateBookingStatus(selectedBooking._id || selectedBooking.id || "", {
                status: "completed",
                trainerNotes,
            });
            void Swal.fire("Completed!", "Booking has been marked as completed.", "success");
            setShowCompleteModal(false);
            setDrawerOpen(false);
            setTrainerNotes("");
            onRefresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to complete booking";
            void Swal.fire("Error", msg, "error");
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        const result = await Swal.fire({
            title: "Cancel Booking?",
            text: "Are you sure you want to cancel this booking?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, cancel it",
        });
        if (!result.isConfirmed) return;
        try {
            await bookingService.cancelBooking(bookingId);
            void Swal.fire("Cancelled!", "Booking has been cancelled.", "success");
            setDrawerOpen(false);
            onRefresh();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to cancel booking";
            void Swal.fire("Error", msg, "error");
        }
    };

    return (
        <div className="box mb-0">
            <div className="box-body">
                {error && (
                    <div
                        className="alert alert-danger mb-4 flex flex-wrap items-center justify-between gap-2"
                        role="alert"
                    >
                        <span>{error}</span>
                        {onRetrySummary && (
                            <button type="button" className="ti-btn ti-btn-sm ti-btn-danger" onClick={onRetrySummary}>
                                Retry
                            </button>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: "Total Bookings", value: totals?.totalBookings ?? 0, icon: "ri-calendar-line" },
                        { label: "Active Sessions", value: totals?.activeReservations ?? 0, icon: "ri-check-line" },
                        { label: "Awaiting action", value: totals?.waitingList ?? 0, icon: "ri-time-line" },
                        { label: "Occupancy", value: totals?.occupancyRate ?? "—", icon: "ri-pie-chart-line" },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-lg border border-defaultborder px-4 py-3 flex items-center justify-between"
                        >
                            <div>
                                <p className="text-xs text-muted mb-1">{stat.label}</p>
                                <p className="text-2xl font-bold text-defaulttextcolor mb-0">
                                    {loading ? "…" : stat.value}
                                </p>
                            </div>
                            <i className={`${stat.icon} text-xl text-primary`} aria-hidden="true"></i>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-12 gap-4">
                    <div className="xl:col-span-8 col-span-12">
                        <div className="flex items-center justify-between mb-3">
                            <h6 className="font-bold text-defaulttextcolor mb-0">Booking Calendar</h6>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onPrevMonth();
                                        setSelectedDay(null);
                                    }}
                                    className="w-8 h-8 rounded-full hover:bg-light flex items-center justify-center text-muted"
                                    aria-label="Previous month"
                                >
                                    <i className="ri-arrow-left-s-line text-lg"></i>
                                </button>
                                <span className="text-sm font-semibold text-defaulttextcolor">{cal.monthLabel}</span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onNextMonth();
                                        setSelectedDay(null);
                                    }}
                                    disabled={nextMonthDisabled}
                                    className="w-8 h-8 rounded-full hover:bg-light flex items-center justify-center text-muted disabled:opacity-40"
                                    aria-label="Next month"
                                >
                                    <i className="ri-arrow-right-s-line text-lg"></i>
                                </button>
                            </div>
                        </div>

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
                                const isSelected = selectedDay === day;
                                const dayBookings = isValid ? calendarDays[day] ?? [] : [];
                                const confirmedTimes = dayBookings.filter((b) => b.status === "confirmed");

                                return (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={!isValid || loading}
                                        onClick={() => isValid && setSelectedDay(day)}
                                        className={`relative min-h-[72px] rounded-lg p-1.5 flex flex-col text-left transition-colors ${
                                            !isValid
                                                ? "invisible"
                                                : isSelected
                                                  ? "ring-2 ring-primary bg-primary/5"
                                                  : isToday
                                                    ? "border-2 border-primary"
                                                    : dayBookings.length
                                                      ? "bg-warning/10 hover:bg-warning/15"
                                                      : "hover:bg-light"
                                        }`}
                                        aria-label={
                                            isValid
                                                ? `Bookings on ${formatDateLabel(day)}, ${dayBookings.length} sessions`
                                                : undefined
                                        }
                                        aria-pressed={isSelected}
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
                                                <div className="flex flex-col gap-0.5 mt-1 overflow-hidden">
                                                    {confirmedTimes.map((b) => (
                                                        <span
                                                            key={b.id}
                                                            className="text-[0.65rem] font-semibold text-success truncate leading-tight"
                                                        >
                                                            {formatBookingTime(b.startTime)}
                                                        </span>
                                                    ))}
                                                    {dayBookings
                                                        .filter((b) => b.status !== "confirmed")
                                                        .slice(0, confirmedTimes.length > 0 ? 1 : 3)
                                                        .map((b) => (
                                                            <span
                                                                key={b.id}
                                                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                                                style={{
                                                                    backgroundColor:
                                                                        STATUS_DOT[b.status] || "#9CA3AF",
                                                                }}
                                                                aria-hidden="true"
                                                            />
                                                        ))}
                                                </div>
                                            </>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-defaultborder">
                            {[
                                { label: "Confirmed (shows time)", color: STATUS_DOT.confirmed },
                                { label: "Pending admin", color: STATUS_DOT.approved },
                                { label: "Needs your accept", color: STATUS_DOT.pending_approval },
                            ].map((l) => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: l.color }} />
                                    <span className="text-xs text-muted">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="xl:col-span-4 col-span-12">
                        <div className="rounded-lg border border-defaultborder p-4 min-h-[280px]">
                            <h6 className="font-bold text-defaulttextcolor mb-3">
                                {selectedDay != null ? formatDateLabel(selectedDay) : "Select a day"}
                            </h6>
                            {selectedDay == null && (
                                <p className="text-sm text-muted mb-0">
                                    Tap a date on the calendar to see sessions, payment status, and actions.
                                </p>
                            )}
                            {selectedDay != null && selectedDayBookings.length === 0 && !loading && (
                                <p className="text-sm text-muted mb-0">No bookings on this day.</p>
                            )}
                            {selectedDay != null && loading && (
                                <p className="text-sm text-muted mb-0">Loading…</p>
                            )}
                            <ul className="flex flex-col gap-3 list-none p-0 m-0">
                                {selectedDayBookings.map((b) => (
                                        <li
                                            key={b.id}
                                            className="rounded-lg border border-defaultborder p-3 bg-light/30 dark:bg-black/10"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <p className="text-sm font-semibold text-defaulttextcolor mb-0">
                                                    {b.companyName || "Company"}
                                                </p>
                                                <StatusBadge status={b.status} />
                                            </div>
                                            <p className="text-xs text-muted mb-1">
                                                {formatBookingTime(b.startTime)} · {b.duration} hr
                                                {b.duration === 1 ? "" : "s"}
                                            </p>
                                            <p className="text-xs mb-2">
                                                <span className="text-muted">Payment: </span>
                                                {b.isPaid ? (
                                                    <span className="font-semibold text-success">Paid</span>
                                                ) : (
                                                    <span className="font-semibold text-warning">Pending</span>
                                                )}
                                            </p>
                                            {b.typeOfTraining.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mb-2">
                                                    {b.typeOfTraining.slice(0, 2).map((t) => (
                                                        <span
                                                            key={t}
                                                            className="badge bg-info/10 text-info text-[0.65rem]"
                                                        >
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            <BookingDayActions
                                                actions={[
                                                    {
                                                        id: "view",
                                                        variant: "info",
                                                        label: "View",
                                                        icon: "ri-eye-line",
                                                        onClick: () => void openBookingView(b.id),
                                                    },
                                                    ...(canConfirmBooking(b.status)
                                                        ? [
                                                              {
                                                                  id: "confirm",
                                                                  variant: "success" as const,
                                                                  label: "Accept",
                                                                  icon: "ri-check-line",
                                                                  disabled: actionLoading,
                                                                  onClick: () =>
                                                                      void openBookingAction(b, "confirm"),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(canCompleteBooking(b.status)
                                                        ? [
                                                              {
                                                                  id: "complete",
                                                                  variant: "primary" as const,
                                                                  label: "Complete",
                                                                  icon: "ri-check-double-line",
                                                                  disabled: actionLoading,
                                                                  onClick: () =>
                                                                      void openBookingAction(b, "complete"),
                                                              },
                                                          ]
                                                        : []),
                                                    ...(canCancelBooking(b.status)
                                                        ? [
                                                              {
                                                                  id: "cancel",
                                                                  variant: "danger" as const,
                                                                  label: "Cancel",
                                                                  icon: "ri-close-circle-line",
                                                                  onClick: () => void handleCancelBooking(b.id),
                                                              },
                                                          ]
                                                        : []),
                                                ]}
                                            />
                                        </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <TrainerBookingDetailsDrawer
                open={drawerOpen}
                booking={selectedBooking}
                loading={drawerLoading}
                onClose={() => setDrawerOpen(false)}
                onConfirm={(booking) => {
                    setSelectedBooking(booking);
                    setTrainerNotes("");
                    setShowConfirmModal(true);
                }}
                onComplete={(booking) => {
                    setSelectedBooking(booking);
                    setTrainerNotes("");
                    setShowCompleteModal(true);
                }}
                onCancel={(id) => void handleCancelBooking(id)}
            />

            {showConfirmModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-lg font-semibold mb-4">Accept Booking</h3>
                        <div className="mb-4">
                            <label className="form-label">Notes (Optional)</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={trainerNotes}
                                onChange={(e) => setTrainerNotes(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <button
                                type="button"
                                className="ti-btn ti-btn-light !m-0 !float-none w-full sm:w-auto inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold rounded-lg border border-defaultborder"
                                onClick={() => setShowConfirmModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="ti-btn ti-btn-success !m-0 !float-none w-full sm:w-auto inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold rounded-lg"
                                onClick={() => void handleConfirmBooking()}
                            >
                                Accept Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCompleteModal && selectedBooking && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-bodybg rounded-lg p-6 w-full max-w-lg">
                        <h3 className="text-lg font-semibold mb-4">Mark as Completed</h3>
                        <div className="mb-4">
                            <label className="form-label">Session Notes (Optional)</label>
                            <textarea
                                className="form-control"
                                rows={3}
                                value={trainerNotes}
                                onChange={(e) => setTrainerNotes(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
                            <button
                                type="button"
                                className="ti-btn ti-btn-light !m-0 !float-none w-full sm:w-auto inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold rounded-lg border border-defaultborder"
                                onClick={() => setShowCompleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="ti-btn ti-btn-primary !m-0 !float-none w-full sm:w-auto inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold rounded-lg"
                                onClick={() => void handleCompleteBooking()}
                            >
                                Mark Completed
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerBookingsCalendarView;
