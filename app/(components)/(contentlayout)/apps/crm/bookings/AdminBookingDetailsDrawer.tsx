"use client";

import React, { useEffect, useState } from "react";
import type { Booking } from "@/services/bookingService";
import bookingInvoiceService, { type BookingInvoice } from "@/services/bookingInvoiceService";
import StatusBadge from "@/shared/components/StatusBadge";
import { canApproveBooking, canAdminCancelBooking, formatBookingDate, formatBookingTime } from "@/shared/utils/bookingUtils";
import { formatInr } from "@/shared/utils/invoiceCalculationUtils";
import CrmRightDrawer from "../components/CrmRightDrawer";
import EapBookingDetailsSection from "@/shared/components/EapBookingDetailsSection";
import BookingSessionsTable from "@/shared/components/booking/BookingSessionsTable";
import {
    getBookingSessions,
    getBookingTrainersLabel,
    getTrainerApprovalProgress,
} from "@/shared/utils/bookingSessionUtils";
import {
    getBookingCompanyName,
    getBookingTrainerName,
    isBookingPaid,
} from "./adminBookingUtils";

export type AdminBookingDetailsDrawerProps = {
    open: boolean;
    booking: Booking | null;
    loading?: boolean;
    onClose: () => void;
    onViewCompany?: () => void;
    onViewTrainer?: () => void;
    onConfirm?: (booking: Booking) => void;
    onReject?: (booking: Booking) => void;
    onCancel?: (booking: Booking) => void;
    canManage?: boolean;
};

/**
 * Booking details drawer for CRM admin with profile shortcuts.
 */
const AdminBookingDetailsDrawer: React.FC<AdminBookingDetailsDrawerProps> = ({
    open,
    booking,
    loading = false,
    onClose,
    onViewCompany,
    onViewTrainer,
    onConfirm,
    onReject,
    onCancel,
    canManage = false,
}) => {
    const [invoice, setInvoice] = useState<BookingInvoice | null>(null);
    const [invoiceLoading, setInvoiceLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const ps = booking?.paymentStatus;
    const paymentObj =
        ps && typeof ps === "object" && !Array.isArray(ps) ? (ps as Record<string, unknown>) : null;
    const sessions = booking ? getBookingSessions(booking) : [];
    const isMultiSession = sessions.length > 1;
    const approvalProgress = booking ? getTrainerApprovalProgress(booking) : null;

    useEffect(() => {
        if (!open || !booking || !isBookingPaid(booking)) {
            setInvoice(null);
            return;
        }

        const bookingId = booking._id || booking.id;
        if (!bookingId) return;

        setInvoiceLoading(true);
        bookingInvoiceService
            .getBookingInvoiceByBookingId(bookingId)
            .then(setInvoice)
            .catch(() => setInvoice(null))
            .finally(() => setInvoiceLoading(false));
    }, [open, booking]);

    const handleDownloadInvoice = async () => {
        if (!invoice) return;
        const invoiceId = invoice._id || invoice.id;
        if (!invoiceId) return;

        try {
            setDownloading(true);
            await bookingInvoiceService.downloadInvoiceHtml(invoiceId, invoice.invoiceNumber);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to download invoice";
            window.alert(msg);
        } finally {
            setDownloading(false);
        }
    };

    const footer =
        booking && !loading ? (
            <div className="flex flex-col gap-2" role="group" aria-label="Booking actions">
                {canManage && canApproveBooking(booking.status) && onConfirm && (
                    <button
                        type="button"
                        className="ti-btn ti-btn-success !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold min-h-[2.5rem] rounded-lg shadow-none"
                        onClick={() => onConfirm(booking)}
                    >
                        Confirm booking
                    </button>
                )}
                {canManage && canApproveBooking(booking.status) && onReject && (
                    <button
                        type="button"
                        className="ti-btn ti-btn-danger !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold min-h-[2.5rem] rounded-lg shadow-none"
                        onClick={() => onReject(booking)}
                    >
                        Reject booking
                    </button>
                )}
                {canManage && canAdminCancelBooking(booking.status) && onCancel && (
                    <button
                        type="button"
                        className="ti-btn ti-btn-warning !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold min-h-[2.5rem] rounded-lg shadow-none"
                        onClick={() => onCancel(booking)}
                    >
                        Cancel meeting
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
        <CrmRightDrawer
            open={open}
            title="Booking details"
            onClose={onClose}
            maxWidthClass="max-w-md"
            ariaLabelledBy="admin-booking-details-title"
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
                    <section className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-muted text-xs block mb-0.5">Status</span>
                            <StatusBadge status={booking.status} />
                        </div>
                        <div>
                            <span className="text-muted text-xs block mb-0.5">Payment</span>
                            {isBookingPaid(booking) ? (
                                <span className="badge bg-success/10 text-success">Paid</span>
                            ) : (
                                <span className="badge bg-warning/10 text-warning">Pending</span>
                            )}
                        </div>
                    </section>

                    <section className="rounded-xl border border-defaultborder p-4 bg-light/30 dark:bg-black/20 space-y-3">
                        <div>
                            <span className="text-muted text-xs block mb-1">Company</span>
                            {onViewCompany ? (
                                <button
                                    type="button"
                                    onClick={onViewCompany}
                                    className="text-sm font-semibold text-primary hover:underline p-0 bg-transparent border-0 text-left"
                                >
                                    {getBookingCompanyName(booking)}
                                    <i className="ri-arrow-right-s-line ms-0.5" aria-hidden="true"></i>
                                </button>
                            ) : (
                                <span className="text-sm font-semibold">{getBookingCompanyName(booking)}</span>
                            )}
                        </div>
                        <div>
                            <span className="text-muted text-xs block mb-1">Trainer(s)</span>
                            {onViewTrainer && !isMultiSession ? (
                                <button
                                    type="button"
                                    onClick={onViewTrainer}
                                    className="text-sm font-semibold text-primary hover:underline p-0 bg-transparent border-0 text-left"
                                >
                                    {getBookingTrainerName(booking)}
                                    <i className="ri-arrow-right-s-line ms-0.5" aria-hidden="true"></i>
                                </button>
                            ) : (
                                <span className="text-sm font-semibold">
                                    {isMultiSession
                                        ? getBookingTrainersLabel(booking)
                                        : getBookingTrainerName(booking)}
                                </span>
                            )}
                        </div>
                        {isMultiSession && approvalProgress && (
                            <p className="text-xs text-muted mb-0">
                                Trainer approvals: {approvalProgress.approved} of {approvalProgress.total}
                            </p>
                        )}
                    </section>

                    <section>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
                            {isMultiSession ? "Sessions" : "Session"}
                        </p>
                        {!isMultiSession && (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-muted text-xs block mb-0.5">Date</span>
                                <span className="font-medium">{formatBookingDate(booking.bookingDate)}</span>
                            </div>
                            <div>
                                <span className="text-muted text-xs block mb-0.5">Time</span>
                                <span className="font-medium">{formatBookingTime(booking.startTime)}</span>
                            </div>
                            <div>
                                <span className="text-muted text-xs block mb-0.5">Duration</span>
                                <span className="font-medium">{booking.duration} hrs</span>
                            </div>
                        </div>
                        )}
                        {isMultiSession && (
                            <>
                                <p className="text-sm font-medium mb-2">
                                    {formatBookingDate(booking.bookingDate)}
                                </p>
                                <BookingSessionsTable booking={booking} />
                                <p className="text-xs text-muted mt-2 mb-0">
                                    One payment applies to all sessions in this booking.
                                </p>
                            </>
                        )}
                    </section>

                    <EapBookingDetailsSection booking={booking} />

                    {!isMultiSession && booking.typeOfTraining?.length > 0 && (
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

                    {booking.trainerNotes && (
                        <section>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                                Trainer notes
                            </p>
                            <p className="text-sm text-defaulttextcolor mb-0">{booking.trainerNotes}</p>
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

                    {booking.cancellationReason && booking.status === "cancelled" && (
                        <section>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-1">
                                Cancellation reason
                            </p>
                            <p className="text-sm text-defaulttextcolor mb-0">{booking.cancellationReason}</p>
                        </section>
                    )}

                    {isBookingPaid(booking) && paymentObj && (
                        <section className="rounded-xl border border-defaultborder p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
                                Payment information
                            </p>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                {Boolean(paymentObj.paymentMode) && (
                                    <div>
                                        <span className="text-muted text-xs block mb-0.5">Mode</span>
                                        <span className="font-medium capitalize">
                                            {String(paymentObj.paymentMode).replace("_", " ")}
                                        </span>
                                    </div>
                                )}
                                {paymentObj.paymentAmount != null && (
                                    <div>
                                        <span className="text-muted text-xs block mb-0.5">Amount</span>
                                        <span className="font-medium">₹{String(paymentObj.paymentAmount)}</span>
                                    </div>
                                )}
                                {Boolean(paymentObj.transactionId) && (
                                    <div className="col-span-2">
                                        <span className="text-muted text-xs block mb-0.5">Transaction ID</span>
                                        <span className="font-medium break-all">{String(paymentObj.transactionId)}</span>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {isBookingPaid(booking) && (
                        <section className="rounded-xl border border-defaultborder p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-3">
                                Trainer fee invoice
                            </p>
                            {invoiceLoading ? (
                                <p className="text-sm text-muted mb-0">Loading invoice…</p>
                            ) : invoice ? (
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="font-medium">{invoice.invoiceNumber}</span>
                                        <span className="badge bg-success/10 text-success text-xs">Confirmed</span>
                                    </div>
                                    <p className="text-xs text-muted mb-0">
                                        Total trainer payout:{" "}
                                        <strong>{formatInr(invoice.totals?.netPayable ?? 0)}</strong>
                                    </p>
                                    <button
                                        type="button"
                                        className="ti-btn ti-btn-sm ti-btn-primary !m-0"
                                        onClick={handleDownloadInvoice}
                                        disabled={downloading}
                                        aria-label="Download trainer fee invoice"
                                    >
                                        <i className="ri-download-line me-1" aria-hidden="true"></i>
                                        {downloading ? "Downloading…" : "Download invoice"}
                                    </button>
                                </div>
                            ) : (
                                <p className="text-sm text-muted mb-0">No invoice found for this booking.</p>
                            )}
                        </section>
                    )}
                </div>
            )}
        </CrmRightDrawer>
    );
};

export default AdminBookingDetailsDrawer;
