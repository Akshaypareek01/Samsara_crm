"use client";

import React from "react";
import { formatInr } from "@/shared/utils/invoiceCalculationUtils";
import type { SessionPaymentInput } from "@/services/bookingService";

export type SessionPaymentLineEditorProps = {
    line: SessionPaymentInput;
    index: number;
    trainerName?: string;
    onChange: (index: number, line: SessionPaymentInput) => void;
};

/**
 * Editable company payment fields for a single booking session.
 */
const SessionPaymentLineEditor: React.FC<SessionPaymentLineEditorProps> = ({
    line,
    index,
    trainerName,
    onChange,
}) => {
    const updateLine = (patch: Partial<SessionPaymentInput>) => {
        onChange(index, { ...line, ...patch });
    };

    return (
        <div className="rounded-xl border border-defaultborder p-4 space-y-4 bg-light/20 dark:bg-black/10">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold mb-0.5">
                        Session {index + 1}
                        {trainerName ? ` · ${trainerName}` : ""}
                    </p>
                    <p className="text-xs text-muted mb-0">
                        {line.startTime || "—"} · {line.duration || 0}h
                        {(line.typeOfTraining?.length ?? 0) > 0 && (
                            <> · {line.typeOfTraining?.join(", ")}</>
                        )}
                    </p>
                </div>
                <span className="badge bg-success/10 text-success text-xs shrink-0">
                    {formatInr(line.paymentAmount || 0)}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="form-label text-xs">
                        Payment mode <span className="text-danger">*</span>
                    </label>
                    <select
                        className="form-control form-control-sm"
                        value={line.paymentMode}
                        onChange={(e) =>
                            updateLine({
                                paymentMode: e.target.value as SessionPaymentInput["paymentMode"],
                            })
                        }
                        required
                        aria-label={`Payment mode for session ${index + 1}`}
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
                    <label className="form-label text-xs">
                        Transaction ID <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        value={line.transactionId}
                        onChange={(e) => updateLine({ transactionId: e.target.value })}
                        required
                        aria-label={`Transaction ID for session ${index + 1}`}
                    />
                </div>
                <div>
                    <label className="form-label text-xs">
                        Payment type <span className="text-danger">*</span>
                    </label>
                    <select
                        className="form-control form-control-sm"
                        value={line.paymentType}
                        onChange={(e) =>
                            updateLine({
                                paymentType: e.target.value as SessionPaymentInput["paymentType"],
                            })
                        }
                        required
                        aria-label={`Payment type for session ${index + 1}`}
                    >
                        <option value="full">Full payment</option>
                        <option value="partial">Partial payment</option>
                        <option value="advance">Advance payment</option>
                    </select>
                </div>
                <div>
                    <label className="form-label text-xs">
                        Amount (₹) <span className="text-danger">*</span>
                    </label>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        value={line.paymentAmount || ""}
                        min={0}
                        step="0.01"
                        onChange={(e) =>
                            updateLine({ paymentAmount: parseFloat(e.target.value) || 0 })
                        }
                        required
                        aria-label={`Payment amount for session ${index + 1}`}
                    />
                </div>
            </div>
        </div>
    );
};

export default SessionPaymentLineEditor;
