"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Booking } from "@/services/bookingService";
import bookingService, {
    type ApproveBookingRequest,
    type SessionPaymentInput,
} from "@/services/bookingService";
import bookingInvoiceService from "@/services/bookingInvoiceService";
import Swal from "sweetalert2";
import {
    aggregateTrainerFeeTotals,
    buildTrainerFeeLine,
    formatInr,
    type TrainerFeeLineInput,
} from "@/shared/utils/invoiceCalculationUtils";
import { formatBookingDate, formatBookingTime } from "@/shared/utils/bookingUtils";
import {
    getBookingCompanyName,
    getBookingTrainerName,
} from "./adminBookingUtils";
import TrainerFeeLineEditor from "./TrainerFeeLineEditor";
import SessionPaymentLineEditor from "./SessionPaymentLineEditor";

export type AdminBookingApprovalModalProps = {
    open: boolean;
    booking: Booking | null;
    onClose: () => void;
    onSuccess: () => void;
};

const defaultSessionPayment = (): Omit<SessionPaymentInput, "sessionIndex"> => ({
    paymentMode: "cash",
    transactionId: "",
    paymentType: "full",
    paymentAmount: 0,
});

/**
 * Build default session payment rows from trainer fee line defaults.
 *
 * @param lines - Default trainer fee lines for the booking.
 */
function buildDefaultSessionPayments(lines: TrainerFeeLineInput[]): SessionPaymentInput[] {
    return lines.map((line, index) => ({
        sessionIndex: line.sessionIndex ?? index,
        startTime: line.startTime,
        duration: line.duration,
        typeOfTraining: line.typeOfTraining,
        trainerName: line.trainerName,
        ...defaultSessionPayment(),
    }));
}

/**
 * Admin modal to confirm booking payment and set per-trainer fee lines.
 */
const AdminBookingApprovalModal: React.FC<AdminBookingApprovalModalProps> = ({
    open,
    booking,
    onClose,
    onSuccess,
}) => {
    const [adminNotes, setAdminNotes] = useState("");
    const [sessionPayments, setSessionPayments] = useState<SessionPaymentInput[]>([]);
    const [trainerLines, setTrainerLines] = useState<TrainerFeeLineInput[]>([]);
    const [loadingDefaults, setLoadingDefaults] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open || !booking) return;

        const bookingId = booking._id || booking.id;
        if (!bookingId) return;

        setAdminNotes("");
        setLoadingDefaults(true);

        bookingInvoiceService
            .getDefaultTrainerFeeLines(bookingId)
            .then((lines) => {
                setTrainerLines(lines);
                setSessionPayments(buildDefaultSessionPayments(lines));
            })
            .catch((err: Error) => {
                void Swal.fire("Error", err.message || "Failed to load trainer fee defaults", "error");
                onClose();
            })
            .finally(() => setLoadingDefaults(false));
    }, [open, booking, onClose]);

    const calculatedLines = useMemo(
        () => trainerLines.map((line) => buildTrainerFeeLine(line)),
        [trainerLines]
    );

    const totals = useMemo(() => aggregateTrainerFeeTotals(calculatedLines), [calculatedLines]);

    const totalCompanyPayment = useMemo(
        () => sessionPayments.reduce((sum, payment) => sum + (payment.paymentAmount || 0), 0),
        [sessionPayments]
    );

    const handleLineChange = (index: number, line: TrainerFeeLineInput) => {
        setTrainerLines((prev) => prev.map((l, i) => (i === index ? line : l)));
    };

    const handleSessionPaymentChange = (index: number, line: SessionPaymentInput) => {
        setSessionPayments((prev) => prev.map((payment, i) => (i === index ? line : payment)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking) return;

        const bookingId = booking._id || booking.id;
        if (!bookingId) {
            void Swal.fire("Error", "Booking ID not found", "error");
            return;
        }

        if (sessionPayments.some((payment) => !payment.transactionId.trim())) {
            void Swal.fire("Error", "Each session requires a transaction ID", "warning");
            return;
        }

        if (sessionPayments.some((payment) => (payment.paymentAmount ?? 0) <= 0)) {
            void Swal.fire("Error", "Each session must have a payment amount greater than 0", "warning");
            return;
        }

        if (trainerLines.some((l) => !l.trainer || (l.baseFee ?? 0) <= 0)) {
            void Swal.fire("Error", "Each trainer must have a base fee greater than 0", "warning");
            return;
        }

        const payload: ApproveBookingRequest = {
            adminNotes: adminNotes.trim() || undefined,
            sessionPayments: sessionPayments.map((payment) => ({
                sessionIndex: payment.sessionIndex,
                paymentMode: payment.paymentMode,
                transactionId: payment.transactionId.trim(),
                paymentType: payment.paymentType,
                paymentAmount: payment.paymentAmount,
            })),
            trainerFeeLines: trainerLines.map((line) => ({
                trainer: line.trainer,
                sessionIndex: line.sessionIndex,
                baseFee: line.baseFee,
                gstRate: line.gstRate ?? 18,
                otherTaxes: (line.otherTaxes || []).map((t) => ({
                    name: t.name,
                    rate: t.rate,
                    type: t.type,
                    amount: t.amount,
                })),
                deductions: (line.deductions || []).map((d) => ({
                    name: d.name,
                    amount: d.amount,
                })),
            })),
        };

        try {
            setSubmitting(true);
            const result = await bookingService.approveBooking(bookingId, payload);
            const invoiceNo = result.invoice?.invoiceNumber;
            void Swal.fire(
                "Success",
                invoiceNo
                    ? `Booking confirmed. Invoice ${invoiceNo} created.`
                    : "Booking confirmed successfully",
                "success"
            );
            onClose();
            onSuccess();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to approve booking";
            void Swal.fire("Error", msg, "error");
        } finally {
            setSubmitting(false);
        }
    };

    if (!open || !booking) return null;

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-approval-modal-title"
        >
            <div className="bg-white dark:bg-bodybg rounded-lg w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl">
                <div className="flex items-center justify-between p-6 border-b border-defaultborder shrink-0">
                    <h3 id="admin-approval-modal-title" className="text-lg font-semibold mb-0">
                        Confirm booking &amp; trainer fees
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="ti-btn ti-btn-sm ti-btn-ghost"
                        aria-label="Close approval modal"
                    >
                        <i className="ri-close-line" aria-hidden="true"></i>
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6">
                    <div className="mb-4 p-4 bg-primary/5 rounded-lg text-sm space-y-1">
                        <p className="mb-0">
                            <strong>Company:</strong> {getBookingCompanyName(booking)}
                        </p>
                        <p className="mb-0">
                            <strong>Trainer(s):</strong> {getBookingTrainerName(booking)}
                        </p>
                        <p className="mb-0">
                            <strong>Date:</strong> {formatBookingDate(booking.bookingDate)} at{" "}
                            {formatBookingTime(booking.startTime)}
                        </p>
                    </div>

                    {loadingDefaults ? (
                        <div className="flex flex-col items-center py-12 gap-3">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading fee lines…</span>
                            </div>
                            <p className="text-sm text-muted mb-0">Loading session payment &amp; trainer fee lines…</p>
                        </div>
                    ) : (
                        <form id="admin-approval-form" onSubmit={handleSubmit} className="space-y-6">
                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold mb-0">Company payment (per session)</h4>
                                    <span className="text-xs text-muted">
                                        Total received:{" "}
                                        <strong className="text-success">{formatInr(totalCompanyPayment)}</strong>
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {sessionPayments.map((payment, index) => (
                                        <SessionPaymentLineEditor
                                            key={`session-payment-${payment.sessionIndex}-${index}`}
                                            line={payment}
                                            index={index}
                                            trainerName={payment.trainerName}
                                            onChange={handleSessionPaymentChange}
                                        />
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <label className="form-label">Admin notes (optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Notes about this confirmation…"
                                    />
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-sm font-semibold mb-0">Trainer fee lines</h4>
                                    <span className="text-xs text-muted">
                                        Total payout:{" "}
                                        <strong className="text-success">{formatInr(totals.netPayable)}</strong>
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {trainerLines.map((line, index) => (
                                        <TrainerFeeLineEditor
                                            key={`${line.trainer}-${line.sessionIndex ?? index}`}
                                            line={line}
                                            index={index}
                                            calculated={calculatedLines[index]}
                                            onChange={handleLineChange}
                                        />
                                    ))}
                                </div>
                            </section>
                        </form>
                    )}
                </div>

                {!loadingDefaults && (
                    <div className="flex justify-end gap-2 p-6 border-t border-defaultborder shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="ti-btn ti-btn-secondary"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="admin-approval-form"
                            className="ti-btn ti-btn-success"
                            disabled={submitting}
                        >
                            {submitting ? "Confirming…" : "Confirm booking"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBookingApprovalModal;
