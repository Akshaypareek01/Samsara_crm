"use client";

import React, { useEffect } from "react";
import type { Booking } from "@/services/bookingService";
import StatusBadge from "@/shared/components/StatusBadge";
import {
    canCancelBooking,
    canCompleteBooking,
    canConfirmBooking,
    formatBookingDate,
    formatBookingTime,
} from "@/shared/utils/bookingUtils";
import {
    getBookingCompany,
    getBookingCompanyContactName,
    getBookingCompanyName,
    getCompanyLogoUrl,
} from "@/shared/utils/companyDisplayUtils";

export type TrainerBookingDetailsDrawerProps = {
    open: boolean;
    booking: Booking | null;
    loading?: boolean;
    onClose: () => void;
    onConfirm?: (booking: Booking) => void;
    onComplete?: (booking: Booking) => void;
    onCancel?: (bookingId: string) => void;
};

/**
 * Right-side drawer showing booking details and company profile for trainers.
 */
const TrainerBookingDetailsDrawer: React.FC<TrainerBookingDetailsDrawerProps> = ({
    open,
    booking,
    loading = false,
    onClose,
    onConfirm,
    onComplete,
    onCancel,
}) => {
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prev;
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    const company = booking ? getBookingCompany(booking) : null;
    const companyName = booking ? getBookingCompanyName(booking) : "Company";
    const contactName = booking ? getBookingCompanyContactName(booking) : "—";
    const logoUrl = getCompanyLogoUrl(company);
    const bookingId = booking?._id || booking?.id || "";

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-[1040] transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />
            <aside
                className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-bodybg shadow-xl z-[1050] flex flex-col animate-slide-in-right"
                role="dialog"
                aria-modal="true"
                aria-labelledby="trainer-booking-drawer-title"
            >
                <div className="flex items-center justify-between px-4 py-3 border-b border-defaultborder dark:border-white/10 shrink-0">
                    <h2 id="trainer-booking-drawer-title" className="text-base font-semibold text-defaulttextcolor mb-0">
                        Booking details
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ti-btn ti-btn-sm ti-btn-ghost !p-2"
                        aria-label="Close booking details"
                    >
                        <i className="ri-close-line text-lg" aria-hidden="true"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 gap-3">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading booking…</span>
                            </div>
                            <p className="text-sm text-muted mb-0">Loading booking…</p>
                        </div>
                    ) : !booking ? (
                        <p className="text-sm text-muted">No booking selected.</p>
                    ) : (
                        <div className="space-y-5">
                            <section className="rounded-xl border border-defaultborder p-4 bg-light/30 dark:bg-black/20">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Company</p>
                                <div className="flex items-start gap-3">
                                    {logoUrl ? (
                                        <img
                                            src={logoUrl}
                                            alt=""
                                            className="w-14 h-14 rounded-lg object-contain border border-defaultborder bg-white p-1 flex-shrink-0"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20"
                                            aria-hidden="true"
                                        >
                                            <span className="text-primary font-bold text-xl">
                                                {companyName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-base font-bold text-defaulttextcolor mb-0 truncate">
                                            {companyName}
                                        </h3>
                                        <p className="text-xs text-muted mt-1 mb-0 truncate">
                                            Contact: {contactName}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Session</p>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-muted text-xs block mb-0.5">Status</span>
                                        <StatusBadge status={booking.status} />
                                    </div>
                                    <div>
                                        <span className="text-muted text-xs block mb-0.5">Payment</span>
                                        {booking.paymentStatus?.isPaid ? (
                                            <span className="badge bg-success/10 text-success">Paid</span>
                                        ) : (
                                            <span className="badge bg-warning/10 text-warning">Pending</span>
                                        )}
                                    </div>
                                    <div>
                                        <span className="text-muted text-xs block mb-0.5">Date</span>
                                        <span className="font-medium text-defaulttextcolor">
                                            {formatBookingDate(booking.bookingDate)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted text-xs block mb-0.5">Time</span>
                                        <span className="font-medium text-defaulttextcolor">
                                            {formatBookingTime(booking.startTime)}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-muted text-xs block mb-0.5">Duration</span>
                                        <span className="font-medium text-defaulttextcolor">{booking.duration} hrs</span>
                                    </div>
                                </div>
                            </section>

                            {booking.typeOfTraining?.length > 0 && (
                                <section>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
                                        Training types
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {booking.typeOfTraining.map((type) => (
                                            <span key={type} className="badge bg-info/10 text-info text-xs">
                                                {type}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {booking.notes && (
                                <section>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                                        Company notes
                                    </p>
                                    <p className="text-sm text-defaulttextcolor mb-0">{booking.notes}</p>
                                </section>
                            )}

                            {booking.adminNotes && (
                                <section>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                                        Admin notes
                                    </p>
                                    <p className="text-sm text-defaulttextcolor mb-0">{booking.adminNotes}</p>
                                </section>
                            )}

                            {booking.trainerNotes && (
                                <section>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                                        Your notes
                                    </p>
                                    <p className="text-sm text-defaulttextcolor mb-0">{booking.trainerNotes}</p>
                                </section>
                            )}

                            {booking.cancellationReason && booking.status === "cancelled" && (
                                <section>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                                        Cancellation reason
                                    </p>
                                    <p className="text-sm text-defaulttextcolor mb-0">{booking.cancellationReason}</p>
                                </section>
                            )}
                        </div>
                    )}
                </div>

                {booking && !loading && (
                    <div
                        className="shrink-0 px-4 py-4 border-t border-defaultborder dark:border-white/10 flex flex-col gap-2"
                        role="group"
                        aria-label="Booking actions"
                    >
                        {canConfirmBooking(booking.status) && onConfirm && (
                            <button
                                type="button"
                                className="ti-btn ti-btn-success !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold whitespace-nowrap min-h-[2.5rem] rounded-lg shadow-none"
                                onClick={() => onConfirm(booking)}
                            >
                                Accept booking
                            </button>
                        )}
                        {canCompleteBooking(booking.status) && onComplete && (
                            <button
                                type="button"
                                className="ti-btn ti-btn-primary !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold whitespace-nowrap min-h-[2.5rem] rounded-lg shadow-none"
                                onClick={() => onComplete(booking)}
                            >
                                Mark as completed
                            </button>
                        )}
                        {canCancelBooking(booking.status) && onCancel && bookingId && (
                            <button
                                type="button"
                                className="ti-btn ti-btn-danger !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold whitespace-nowrap min-h-[2.5rem] rounded-lg shadow-none"
                                onClick={() => onCancel(bookingId)}
                            >
                                Cancel booking
                            </button>
                        )}
                        <button
                            type="button"
                            className="ti-btn ti-btn-light !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold whitespace-nowrap min-h-[2.5rem] rounded-lg border border-defaultborder shadow-none"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default TrainerBookingDetailsDrawer;
