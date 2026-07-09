"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Booking } from "@/services/bookingService";
import bookingService, { type ApproveBookingRequest } from "@/services/bookingService";
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

export type AdminBookingApprovalModalProps = {
    open: boolean;
    booking: Booking | null;
    onClose: () => void;
    onSuccess: () => void;
};

const defaultPayment: Omit<ApproveBookingRequest, "trainerFeeLines"> = {
    paymentMode: "cash",
    transactionId: "",
    paymentType: "full",
    paymentAmount: 0,
    adminNotes: "",
};

/**
 * Admin modal to confirm booking payment and set per-trainer fee lines.
 */
const AdminBookingApprovalModal: React.FC<AdminBookingApprovalModalProps> = ({
    open,
    booking,
    onClose,
    onSuccess,
}) => {
    const [payment, setPayment] = useState(defaultPayment);
    const [trainerLines, setTrainerLines] = useState<TrainerFeeLineInput[]>([]);
    const [loadingDefaults, setLoadingDefaults] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!open || !booking) return;

        const bookingId = booking._id || booking.id;
        if (!bookingId) return;

        setPayment(defaultPayment);
        setLoadingDefaults(true);

        bookingInvoiceService
            .getDefaultTrainerFeeLines(bookingId)
            .then((lines) => setTrainerLines(lines))
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

    const handleLineChange = (index: number, line: TrainerFeeLineInput) => {
        setTrainerLines((prev) => prev.map((l, i) => (i === index ? line : l)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!booking) return;

        const bookingId = booking._id || booking.id;
        if (!bookingId) {
            void Swal.fire("Error", "Booking ID not found", "error");
            return;
        }

        if (!payment.transactionId.trim()) {
            void Swal.fire("Error", "Transaction ID is required", "warning");
            return;
        }

        if (trainerLines.some((l) => !l.trainer || (l.baseFee ?? 0) <= 0)) {
            void Swal.fire("Error", "Each trainer must have a base fee greater than 0", "warning");
            return;
        }

        const payload: ApproveBookingRequest = {
            ...payment,
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
                            <p className="text-sm text-muted mb-0">Loading trainer fee lines…</p>
                        </div>
                    ) : (
                        <form id="admin-approval-form" onSubmit={handleSubmit} className="space-y-6">
                            <section>
                                <h4 className="text-sm font-semibold mb-3">Company payment</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">
                                            Payment mode <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-control"
                                            value={payment.paymentMode}
                                            onChange={(e) =>
                                                setPayment({
                                                    ...payment,
                                                    paymentMode: e.target.value as ApproveBookingRequest["paymentMode"],
                                                })
                                            }
                                            required
                                        >
                                            <option value="cash">Cash</option>
                                            <option value="card">Card</option>
                                            <option value="upi">UPI</option>
                                            <option value="bank_transfer">Bank Transfer</option>
                                            <option value="cheque">Cheque</option>
                                            <option value="online">Online</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">
                                            Transaction ID <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={payment.transactionId}
                                            onChange={(e) =>
                                                setPayment({ ...payment, transactionId: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label">
                                            Payment type <span className="text-danger">*</span>
                                        </label>
                                        <select
                                            className="form-control"
                                            value={payment.paymentType}
                                            onChange={(e) =>
                                                setPayment({
                                                    ...payment,
                                                    paymentType: e.target.value as ApproveBookingRequest["paymentType"],
                                                })
                                            }
                                            required
                                        >
                                            <option value="full">Full payment</option>
                                            <option value="partial">Partial payment</option>
                                            <option value="advance">Advance payment</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">
                                            Payment amount (₹) <span className="text-danger">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={payment.paymentAmount || ""}
                                            onChange={(e) =>
                                                setPayment({
                                                    ...payment,
                                                    paymentAmount: parseFloat(e.target.value) || 0,
                                                })
                                            }
                                            min={0}
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="form-label">Admin notes (optional)</label>
                                    <textarea
                                        className="form-control"
                                        rows={2}
                                        value={payment.adminNotes}
                                        onChange={(e) =>
                                            setPayment({ ...payment, adminNotes: e.target.value })
                                        }
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
