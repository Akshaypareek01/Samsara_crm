"use client";

import React, { useState, useEffect, useCallback } from "react";
import bookingService, { Booking } from "@/services/bookingService";
import { clearCompanyInsightsCache } from "@/services/companyInsightsClient";
import StatusBadge from "@/shared/components/StatusBadge";
import { canCompanyCancelBooking } from "@/shared/utils/bookingUtils";
import {
    getBookingSessionSummary,
    getBookingTrainersLabel,
} from "@/shared/utils/bookingSessionUtils";
import CompanyBookingDetailsDrawer from "./CompanyBookingDetailsDrawer";
import CompanyTrainerProfileDrawer from "./CompanyTrainerProfileDrawer";
import { useCompanyTrainerProfileDrawer } from "../hooks/useCompanyTrainerProfileDrawer";
import { BookingsTableToolbar, BookingsTableFooter } from "@/shared/components/BookingsTablePagination";
import BookingCancellationReasonNote from "@/shared/components/booking/BookingCancellationReasonNote";
import Swal from "sweetalert2";

type CompanyBookingsListProps = {
    refreshTrigger?: number;
    onBookingChanged?: () => void;
};

const CompanyBookingsList: React.FC<CompanyBookingsListProps> = ({
    refreshTrigger = 0,
    onBookingChanged,
}) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerLoading, setDrawerLoading] = useState(false);
    const {
        trainerDrawerOpen,
        trainerDrawerLoading,
        profileTrainer,
        openTrainerProfile,
        closeTrainerProfile,
    } = useCompanyTrainerProfileDrawer();

    const loadBookings = useCallback(async () => {
        try {
            setLoading(true);
            const params: {
                page: number;
                limit: number;
                sortBy: string;
                status?: string;
            } = {
                page: currentPage,
                limit: pageSize,
                sortBy: "createdAt:desc",
            };

            if (statusFilter) {
                params.status = statusFilter;
            }

            const response = await bookingService.getMyBookings(params);
            setBookings(response.results);
            setTotalPages(response.totalPages);
            setTotalResults(response.totalResults);
        } catch (error) {
            console.error("Error loading bookings:", error);
            void Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to load bookings. Please try again.",
            });
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, statusFilter]);

    useEffect(() => {
        void loadBookings();
    }, [loadBookings, refreshTrigger]);

    /**
     * Prompts for a cancellation reason and cancels the booking.
     *
     * @param bookingId - Booking identifier.
     */
    const handleCancelBooking = async (bookingId: string) => {
        const result = await Swal.fire({
            title: "Cancel Booking?",
            text: "Please provide a reason for cancellation.",
            input: "textarea",
            inputLabel: "Cancellation reason",
            inputPlaceholder: "Why are you cancelling this booking?",
            inputAttributes: {
                "aria-label": "Cancellation reason",
            },
            inputValidator: (value) => {
                if (!value?.trim()) {
                    return "Cancellation reason is required";
                }
                return undefined;
            },
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, cancel it",
        });

        if (result.isConfirmed && result.value) {
            try {
                await bookingService.cancelBooking(bookingId, {
                    cancellationReason: String(result.value).trim(),
                });
                clearCompanyInsightsCache();
                void Swal.fire("Cancelled!", "Your booking has been cancelled.", "success");
                setDrawerOpen(false);
                setSelectedBooking(null);
                void loadBookings();
                onBookingChanged?.();
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : "Failed to cancel booking";
                void Swal.fire("Error", msg, "error");
            }
        }
    };

    /**
     * Opens the details drawer and loads the full booking with trainer profile.
     *
     * @param booking - List row booking (may be partially populated).
     */
    const viewDetails = async (booking: Booking) => {
        const id = booking._id || booking.id || "";
        if (!id) return;
        setDrawerOpen(true);
        setDrawerLoading(true);
        setSelectedBooking(booking);
        try {
            const full = await bookingService.getBookingById(id);
            setSelectedBooking(full);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to load booking details";
            void Swal.fire({ icon: "error", title: "Error", text: msg });
            setDrawerOpen(false);
        } finally {
            setDrawerLoading(false);
        }
    };

    const getTrainerTitle = (booking: Booking): string => {
        if (!booking.trainer || typeof booking.trainer === "string") return "";
        return booking.trainer?.title || "";
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timeString: string) => {
        const [hours, minutes] = timeString.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const closeDrawer = () => {
        setDrawerOpen(false);
        setSelectedBooking(null);
    };

    return (
        <div className="box">
            <div className="box-header flex flex-wrap items-center justify-between gap-2">
                <h6 className="box-title font-bold !mb-0">All bookings</h6>
            </div>
            <div className="box-body">
                <div className="mb-4">
                    <select
                        className="form-control max-w-xs"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        aria-label="Filter bookings by status"
                    >
                        <option value="">All Status</option>
                        <option value="pending_approval">Pending Trainer Approval</option>
                        <option value="approved">Trainer Accepted — Awaiting Admin</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {!loading && (
                    <BookingsTableToolbar
                        page={currentPage}
                        totalPages={totalPages}
                        totalResults={totalResults}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                        idPrefix="company-bookings"
                    />
                )}

                {loading ? (
                    <div className="text-center py-8">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-8">
                        <i className="ri-calendar-line text-muted" style={{ fontSize: "48px" }} aria-hidden="true"></i>
                        <p className="mt-3 text-muted">No bookings found</p>
                        <p className="text-sm text-muted">Your bookings will appear here</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                            <table className="table table-bordered table-hover whitespace-nowrap min-w-full">
                                <thead>
                                    <tr>
                                        <th scope="col">Trainer</th>
                                        <th scope="col">Date &amp; Time</th>
                                        <th scope="col">Duration</th>
                                        <th scope="col">Training Types</th>
                                        <th scope="col">Booking status</th>
                                        <th scope="col">Payment</th>
                                        <th scope="col" className="!text-end min-w-[9rem]">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking._id || booking.id}>
                                            <td>
                                                <div>
                                                    <button
                                                        type="button"
                                                        onClick={() => void openTrainerProfile(booking.trainer)}
                                                        className="font-semibold text-primary hover:underline p-0 bg-transparent border-0 text-left"
                                                        aria-label={`View profile for ${getBookingTrainersLabel(booking)}`}
                                                    >
                                                        {getBookingTrainersLabel(booking)}
                                                    </button>
                                                    <div className="text-xs text-muted mt-0.5">
                                                        {getBookingSessionSummary(booking).label}
                                                    </div>
                                                    {getTrainerTitle(booking) && (
                                                        <div className="text-sm text-muted">
                                                            {getTrainerTitle(booking)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">
                                                        {formatDate(booking.bookingDate)}
                                                    </span>
                                                    <span className="text-sm text-muted">
                                                        {formatTime(booking.startTime)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>{booking.duration} hrs</td>
                                            <td>
                                                <div className="flex flex-wrap gap-1">
                                                    {booking.typeOfTraining.slice(0, 2).map((type, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="badge bg-info/10 text-info text-xs"
                                                        >
                                                            {type}
                                                        </span>
                                                    ))}
                                                    {booking.typeOfTraining.length > 2 && (
                                                        <span className="badge bg-secondary/10 text-secondary text-xs">
                                                            +{booking.typeOfTraining.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <StatusBadge status={booking.status} />
                                                <BookingCancellationReasonNote
                                                    status={booking.status}
                                                    cancellationReason={booking.cancellationReason}
                                                />
                                            </td>
                                            <td>
                                                {booking.paymentStatus?.isPaid ? (
                                                    <span className="badge bg-success/10 text-success">Paid</span>
                                                ) : (
                                                    <span className="badge bg-warning/10 text-warning">Pending</span>
                                                )}
                                            </td>
                                            <td className="!text-end align-middle">
                                                <div
                                                    className="inline-flex items-stretch rounded-lg border border-defaultborder dark:border-white/10 overflow-hidden divide-x divide-defaultborder dark:divide-white/10 shrink-0"
                                                    role="group"
                                                    aria-label={`Actions for ${getBookingTrainersLabel(booking)}`}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => void viewDetails(booking)}
                                                        className="!m-0 !float-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap bg-info/10 text-info hover:bg-info/20 border-0 transition-colors min-h-[2.25rem]"
                                                        title="View details"
                                                    >
                                                        <i className="ri-eye-line text-sm leading-none" aria-hidden="true"></i>
                                                        View
                                                    </button>
                                                    {canCompanyCancelBooking(booking.status) && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void handleCancelBooking(
                                                                    booking._id || booking.id || ""
                                                                )
                                                            }
                                                            className="!m-0 !float-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap bg-danger/10 text-danger hover:bg-danger/20 border-0 transition-colors min-h-[2.25rem]"
                                                            title="Cancel booking"
                                                        >
                                                            <i
                                                                className="ri-close-circle-line text-sm leading-none"
                                                                aria-hidden="true"
                                                            ></i>
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                    </div>
                )}

                {!loading && (
                    <BookingsTableFooter
                        page={currentPage}
                        totalPages={totalPages}
                        totalResults={totalResults}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                        idPrefix="company-bookings"
                    />
                )}
            </div>

            <CompanyBookingDetailsDrawer
                open={drawerOpen}
                booking={selectedBooking}
                loading={drawerLoading}
                onClose={closeDrawer}
                onCancel={(id) => void handleCancelBooking(id)}
                onViewTrainer={
                    selectedBooking?.trainer
                        ? () => void openTrainerProfile(selectedBooking.trainer)
                        : undefined
                }
            />

            <CompanyTrainerProfileDrawer
                open={trainerDrawerOpen}
                trainer={profileTrainer}
                loading={trainerDrawerLoading}
                returnTo="/company/dashboard/bookings"
                onClose={closeTrainerProfile}
            />
        </div>
    );
};

export default CompanyBookingsList;
