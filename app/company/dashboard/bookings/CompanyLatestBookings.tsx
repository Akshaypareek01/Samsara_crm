"use client";

import React, { useCallback, useEffect, useState } from "react";
import bookingService, { Booking } from "@/services/bookingService";
import StatusBadge from "@/shared/components/StatusBadge";
import {
    canCompanyCancelBooking,
    formatBookingDate,
    formatBookingTime,
} from "@/shared/utils/bookingUtils";
import { getBookingTrainerName } from "@/shared/utils/bookingTrainerUtils";
import CompanyBookingDetailsDrawer from "../components/CompanyBookingDetailsDrawer";
import CompanyTrainerProfileDrawer from "../components/CompanyTrainerProfileDrawer";
import { useCompanyTrainerProfileDrawer } from "../hooks/useCompanyTrainerProfileDrawer";
import Swal from "sweetalert2";

const LATEST_BOOKINGS_LIMIT = 5;

type Props = {
    refreshTrigger?: number;
    /** Switches the parent page to the full Table view. */
    onViewAll: () => void;
    /** Notifies the parent that a booking changed (e.g. cancelled) so summary data can refresh. */
    onBookingChanged?: () => void;
};

/**
 * Compact "latest bookings" preview shown on the Calendar tab, using the
 * same fields/columns as the full Table tab (CompanyBookingsList).
 */
const CompanyLatestBookings: React.FC<Props> = ({ refreshTrigger = 0, onViewAll, onBookingChanged }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
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

    const loadLatest = useCallback(async () => {
        try {
            setLoading(true);
            const response = await bookingService.getMyBookings({
                page: 1,
                limit: LATEST_BOOKINGS_LIMIT,
                sortBy: "createdAt:desc",
            });
            setBookings(response.results);
        } catch (error) {
            console.error("Error loading latest bookings:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadLatest();
    }, [loadLatest, refreshTrigger]);

    const getTrainerTitle = (booking: Booking): string => {
        if (!booking.trainer || typeof booking.trainer === "string") return "";
        return booking.trainer?.title || "";
    };

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

    const closeDrawer = () => {
        setDrawerOpen(false);
        setSelectedBooking(null);
    };

    const handleCancelBooking = async (bookingId: string) => {
        const result = await Swal.fire({
            title: "Cancel Booking?",
            text: "Please provide a reason for cancellation.",
            input: "textarea",
            inputLabel: "Cancellation reason",
            inputPlaceholder: "Why are you cancelling this booking?",
            inputAttributes: { "aria-label": "Cancellation reason" },
            inputValidator: (value) => (!value?.trim() ? "Cancellation reason is required" : undefined),
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
                void Swal.fire("Cancelled!", "Your booking has been cancelled.", "success");
                setDrawerOpen(false);
                setSelectedBooking(null);
                void loadLatest();
                onBookingChanged?.();
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : "Failed to cancel booking";
                void Swal.fire("Error", msg, "error");
            }
        }
    };

    return (
        <div className="box mb-6">
            <div className="box-header flex items-center justify-between flex-wrap gap-3">
                <h6 className="box-title font-bold !mb-0">Latest Bookings</h6>
                <button
                    type="button"
                    onClick={onViewAll}
                    className="ti-btn ti-btn-sm ti-btn-light !mb-0"
                >
                    View all
                    <i className="ri-arrow-right-line ms-1" aria-hidden="true"></i>
                </button>
            </div>
            <div className="box-body p-0">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-8">
                        <i className="ri-calendar-line text-muted" style={{ fontSize: "48px" }} aria-hidden="true"></i>
                        <p className="mt-3 text-muted mb-0">No bookings yet</p>
                    </div>
                ) : (
                    <div className="table-responsive w-full">
                        <table className="table table-bordered table-hover whitespace-nowrap min-w-full mb-0">
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
                                                    aria-label={`View profile for ${getBookingTrainerName(booking)}`}
                                                >
                                                    {getBookingTrainerName(booking)}
                                                </button>
                                                {getTrainerTitle(booking) && (
                                                    <div className="text-sm text-muted">{getTrainerTitle(booking)}</div>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">
                                                    {formatBookingDate(booking.bookingDate)}
                                                </span>
                                                <span className="text-sm text-muted">
                                                    {formatBookingTime(booking.startTime)}
                                                </span>
                                            </div>
                                        </td>
                                        <td>{booking.duration} hrs</td>
                                        <td>
                                            <div className="flex flex-wrap gap-1">
                                                {booking.typeOfTraining.slice(0, 2).map((type, idx) => (
                                                    <span key={idx} className="badge bg-info/10 text-info text-xs">
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
                                                aria-label={`Actions for ${getBookingTrainerName(booking)}`}
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
                                                            void handleCancelBooking(booking._id || booking.id || "")
                                                        }
                                                        className="!m-0 !float-none inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap bg-danger/10 text-danger hover:bg-danger/20 border-0 transition-colors min-h-[2.25rem]"
                                                        title="Cancel booking"
                                                    >
                                                        <i className="ri-close-circle-line text-sm leading-none" aria-hidden="true"></i>
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
            </div>

            <CompanyBookingDetailsDrawer
                open={drawerOpen}
                booking={selectedBooking}
                loading={drawerLoading}
                onClose={closeDrawer}
                onCancel={(id) => void handleCancelBooking(id)}
                onViewTrainer={
                    selectedBooking?.trainer ? () => void openTrainerProfile(selectedBooking.trainer) : undefined
                }
            />

            <CompanyTrainerProfileDrawer
                open={trainerDrawerOpen}
                trainer={profileTrainer}
                loading={trainerDrawerLoading}
                onClose={closeTrainerProfile}
            />
        </div>
    );
};

export default CompanyLatestBookings;
