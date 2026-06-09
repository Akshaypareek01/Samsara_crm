"use client";

import React from "react";
import type { Booking } from "@/services/bookingService";
import StatusBadge from "@/shared/components/StatusBadge";
import {
    canCompanyCancelBooking,
    formatBookingDate,
    formatBookingTime,
} from "@/shared/utils/bookingUtils";
import {
    formatTrainerLocation,
    getBookingTrainer,
    getBookingTrainerName,
    getTrainerProfilePhotoUrl,
} from "@/shared/utils/bookingTrainerUtils";
import CompanyRightDrawer from "./CompanyRightDrawer";
import EapBookingDetailsSection from "@/shared/components/EapBookingDetailsSection";
import { useCompanyRating } from "../context/CompanyRatingContext";

export type CompanyBookingDetailsDrawerProps = {
    open: boolean;
    booking: Booking | null;
    loading?: boolean;
    onClose: () => void;
    onCancel?: (bookingId: string) => void;
    onViewTrainer?: () => void;
};

/**
 * Right drawer with full booking details for company users.
 */
const CompanyBookingDetailsDrawer: React.FC<CompanyBookingDetailsDrawerProps> = ({
    open,
    booking,
    loading = false,
    onClose,
    onCancel,
    onViewTrainer,
}) => {
    const { openRatingDrawer, pendingBookingIds } = useCompanyRating();
    const trainer = booking ? getBookingTrainer(booking) : null;
    const trainerName = booking ? getBookingTrainerName(booking) : "Trainer";
    const photoUrl = getTrainerProfilePhotoUrl(trainer);
    const locationLine = formatTrainerLocation(trainer);
    const bookingId = booking?._id || booking?.id || "";

    const isCompleted = booking?.status === "completed";
    const isUnrated = bookingId ? pendingBookingIds.has(bookingId) : false;

    const footer =
        booking && !loading ? (
            <div className="flex flex-col gap-2" role="group" aria-label="Booking actions">
                {isCompleted && bookingId && (
                    <button
                        type="button"
                        className="ti-btn ti-btn-primary !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold min-h-[2.5rem] rounded-lg shadow-none"
                        onClick={() => openRatingDrawer(bookingId)}
                        aria-label={isUnrated ? "Rate this session" : "View or update session rating"}
                    >
                        <i className="ri-star-line me-1" aria-hidden="true" />
                        {isUnrated ? "Rate this session" : "View rating"}
                    </button>
                )}
                {canCompanyCancelBooking(booking.status) && onCancel && bookingId && (
                    <button
                        type="button"
                        className="ti-btn ti-btn-danger !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold min-h-[2.5rem] rounded-lg shadow-none"
                        onClick={() => onCancel(bookingId)}
                    >
                        Cancel booking
                    </button>
                )}
                <button
                    type="button"
                    className="ti-btn ti-btn-light !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold min-h-[2.5rem] rounded-lg border border-defaultborder shadow-none"
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        ) : undefined;

    return (
        <CompanyRightDrawer
            open={open}
            title="Booking details"
            onClose={onClose}
            maxWidthClass="max-w-md"
            ariaLabelledBy="company-booking-details-title"
            footer={footer}
        >
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading booking…</span>
                    </div>
                    <p className="text-sm text-muted mb-0">Loading booking…</p>
                </div>
            ) : !booking ? (
                <p className="text-sm text-muted mb-0">No booking selected.</p>
            ) : (
                <div className="space-y-5">
                    <section className="rounded-xl border border-defaultborder p-4 bg-light/30 dark:bg-black/20">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">Trainer</p>
                        <div className="flex items-start gap-3">
                            {photoUrl ? (
                                <img
                                    src={photoUrl}
                                    alt=""
                                    className="w-14 h-14 rounded-lg object-cover border border-defaultborder flex-shrink-0"
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
                                        {trainerName.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                {onViewTrainer ? (
                                    <button
                                        type="button"
                                        onClick={onViewTrainer}
                                        className="text-base font-bold text-primary hover:underline p-0 bg-transparent border-0 text-left truncate block max-w-full mb-0.5"
                                    >
                                        {trainerName}
                                    </button>
                                ) : (
                                    <h3 className="text-base font-bold text-defaulttextcolor mb-0.5 truncate">
                                        {trainerName}
                                    </h3>
                                )}
                                {trainer?.title && (
                                    <p className="text-sm text-muted mb-1 truncate">{trainer.title}</p>
                                )}
                                {trainer?.email && (
                                    <p className="text-xs text-muted mb-1 truncate">
                                        <i className="ri-mail-line me-1" aria-hidden="true"></i>
                                        {trainer.email}
                                    </p>
                                )}
                                <p className="text-sm text-defaulttextcolor mb-0 leading-relaxed">
                                    <i className="ri-map-pin-line me-1 text-muted align-top mt-0.5" aria-hidden="true"></i>
                                    {locationLine}
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

                    <EapBookingDetailsSection booking={booking} />

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
                                Your notes
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
                                Trainer notes
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

                    {booking.paymentStatus?.isPaid && (
                        <section className="rounded-xl border border-defaultborder p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
                                Payment information
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {booking.paymentStatus.paymentMode && (
                                    <div>
                                        <span className="text-muted text-xs block mb-0.5">Mode</span>
                                        <span className="font-medium text-defaulttextcolor capitalize">
                                            {booking.paymentStatus.paymentMode.replace("_", " ")}
                                        </span>
                                    </div>
                                )}
                                {booking.paymentStatus.paymentType && (
                                    <div>
                                        <span className="text-muted text-xs block mb-0.5">Type</span>
                                        <span className="font-medium text-defaulttextcolor capitalize">
                                            {booking.paymentStatus.paymentType}
                                        </span>
                                    </div>
                                )}
                                {booking.paymentStatus.paymentAmount != null && (
                                    <div>
                                        <span className="text-muted text-xs block mb-0.5">Amount</span>
                                        <span className="font-medium text-defaulttextcolor">
                                            ₹{booking.paymentStatus.paymentAmount}
                                        </span>
                                    </div>
                                )}
                                {booking.paymentStatus.transactionId && (
                                    <div className="col-span-2">
                                        <span className="text-muted text-xs block mb-0.5">Transaction ID</span>
                                        <span className="font-medium text-defaulttextcolor break-all">
                                            {booking.paymentStatus.transactionId}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </CompanyRightDrawer>
    );
};

export default CompanyBookingDetailsDrawer;
