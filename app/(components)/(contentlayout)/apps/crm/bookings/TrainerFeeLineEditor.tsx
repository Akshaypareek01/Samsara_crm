"use client";

import React from "react";
import {
    buildTrainerFeeLine,
    formatInr,
    type CalculatedTrainerFeeLine,
    type DeductionRowInput,
    type TaxRowInput,
    type TrainerFeeLineInput,
} from "@/shared/utils/invoiceCalculationUtils";

export type TrainerFeeLineEditorProps = {
    line: TrainerFeeLineInput;
    index: number;
    calculated: CalculatedTrainerFeeLine;
    onChange: (index: number, line: TrainerFeeLineInput) => void;
};

/**
 * Editable trainer fee line with GST, other taxes, and deductions.
 */
const TrainerFeeLineEditor: React.FC<TrainerFeeLineEditorProps> = ({
    line,
    index,
    calculated,
    onChange,
}) => {
    const updateLine = (patch: Partial<TrainerFeeLineInput>) => {
        const next = { ...line, ...patch };
        if (patch.baseFee !== undefined) {
            const tdsIndex = next.deductions.findIndex((d) => d.name.toLowerCase().includes("tds"));
            if (tdsIndex >= 0) {
                const tdsAmount = Math.round((Number(patch.baseFee) || 0) * 0.1 * 100) / 100;
                next.deductions = next.deductions.map((d, i) =>
                    i === tdsIndex ? { ...d, amount: tdsAmount } : d
                );
            }
        }
        onChange(index, next);
    };

    const updateOtherTax = (taxIndex: number, patch: Partial<TaxRowInput>) => {
        const otherTaxes = [...(line.otherTaxes || [])];
        otherTaxes[taxIndex] = { ...otherTaxes[taxIndex], ...patch };
        updateLine({ otherTaxes });
    };

    const addOtherTax = () => {
        updateLine({
            otherTaxes: [...(line.otherTaxes || []), { name: "CESS", rate: 0, type: "percentage" }],
        });
    };

    const removeOtherTax = (taxIndex: number) => {
        updateLine({ otherTaxes: (line.otherTaxes || []).filter((_, i) => i !== taxIndex) });
    };

    const updateDeduction = (dedIndex: number, patch: Partial<DeductionRowInput>) => {
        const deductions = [...(line.deductions || [])];
        deductions[dedIndex] = { ...deductions[dedIndex], ...patch };
        updateLine({ deductions });
    };

    const addDeduction = () => {
        updateLine({
            deductions: [...(line.deductions || []), { name: "Other deduction", amount: 0 }],
        });
    };

    const removeDeduction = (dedIndex: number) => {
        updateLine({ deductions: (line.deductions || []).filter((_, i) => i !== dedIndex) });
    };

    return (
        <div className="rounded-xl border border-defaultborder p-4 space-y-4 bg-light/20 dark:bg-black/10">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold mb-0.5">
                        {line.trainerName || `Trainer ${index + 1}`}
                    </p>
                    <p className="text-xs text-muted mb-0">
                        {line.startTime || "—"} · {line.duration || 0}h
                        {(line.typeOfTraining?.length ?? 0) > 0 && (
                            <> · {line.typeOfTraining?.join(", ")}</>
                        )}
                    </p>
                </div>
                <span className="badge bg-primary/10 text-primary text-xs shrink-0">
                    Net {formatInr(calculated.netPayable)}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="form-label text-xs">Base fee (₹) *</label>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        value={line.baseFee || ""}
                        min={0}
                        step="0.01"
                        onChange={(e) => updateLine({ baseFee: parseFloat(e.target.value) || 0 })}
                        required
                        aria-label={`Base fee for ${line.trainerName || "trainer"}`}
                    />
                </div>
                <div>
                    <label className="form-label text-xs">GST rate (%)</label>
                    <input
                        type="number"
                        className="form-control form-control-sm"
                        value={line.gstRate ?? 18}
                        min={0}
                        max={100}
                        step="0.01"
                        onChange={(e) => updateLine({ gstRate: parseFloat(e.target.value) || 0 })}
                        aria-label={`GST rate for ${line.trainerName || "trainer"}`}
                    />
                    <p className="text-xs text-muted mt-1 mb-0">GST: {formatInr(calculated.gstAmount)}</p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Other taxes
                    </span>
                    <button
                        type="button"
                        className="ti-btn ti-btn-xs ti-btn-primary"
                        onClick={addOtherTax}
                        aria-label="Add other tax"
                    >
                        <i className="ri-add-line" aria-hidden="true"></i>
                    </button>
                </div>
                {(line.otherTaxes || []).length === 0 ? (
                    <p className="text-xs text-muted mb-0">No additional taxes</p>
                ) : (
                    <div className="space-y-2">
                        {(line.otherTaxes || []).map((tax, taxIndex) => (
                            <div key={taxIndex} className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Tax name"
                                        value={tax.name}
                                        onChange={(e) => updateOtherTax(taxIndex, { name: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <select
                                        className="form-control form-control-sm"
                                        value={tax.type}
                                        onChange={(e) =>
                                            updateOtherTax(taxIndex, {
                                                type: e.target.value as "percentage" | "fixed",
                                            })
                                        }
                                    >
                                        <option value="percentage">%</option>
                                        <option value="fixed">Fixed ₹</option>
                                    </select>
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder={tax.type === "fixed" ? "Amount" : "Rate"}
                                        value={tax.type === "fixed" ? tax.amount ?? 0 : tax.rate}
                                        min={0}
                                        step="0.01"
                                        onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            if (tax.type === "fixed") {
                                                updateOtherTax(taxIndex, { amount: val });
                                            } else {
                                                updateOtherTax(taxIndex, { rate: val });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <button
                                        type="button"
                                        className="ti-btn ti-btn-xs ti-btn-danger w-full"
                                        onClick={() => removeOtherTax(taxIndex)}
                                        aria-label="Remove tax"
                                    >
                                        <i className="ri-delete-bin-line" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Deductions
                    </span>
                    <button
                        type="button"
                        className="ti-btn ti-btn-xs ti-btn-primary"
                        onClick={addDeduction}
                        aria-label="Add deduction"
                    >
                        <i className="ri-add-line" aria-hidden="true"></i>
                    </button>
                </div>
                {(line.deductions || []).length === 0 ? (
                    <p className="text-xs text-muted mb-0">No deductions</p>
                ) : (
                    <div className="space-y-2">
                        {(line.deductions || []).map((ded, dedIndex) => (
                            <div key={dedIndex} className="grid grid-cols-12 gap-2 items-end">
                                <div className="col-span-7">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Deduction name"
                                        value={ded.name}
                                        onChange={(e) => updateDeduction(dedIndex, { name: e.target.value })}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="number"
                                        className="form-control form-control-sm"
                                        placeholder="Amount"
                                        value={ded.amount || ""}
                                        min={0}
                                        step="0.01"
                                        onChange={(e) =>
                                            updateDeduction(dedIndex, {
                                                amount: parseFloat(e.target.value) || 0,
                                            })
                                        }
                                    />
                                </div>
                                <div className="col-span-2">
                                    <button
                                        type="button"
                                        className="ti-btn ti-btn-xs ti-btn-danger w-full"
                                        onClick={() => removeDeduction(dedIndex)}
                                        aria-label="Remove deduction"
                                    >
                                        <i className="ri-delete-bin-line" aria-hidden="true"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-defaultborder">
                <div>
                    <span className="text-muted block">Gross</span>
                    <span className="font-medium">{formatInr(calculated.grossAmount)}</span>
                </div>
                <div>
                    <span className="text-muted block">Deductions</span>
                    <span className="font-medium text-danger">-{formatInr(calculated.totalDeductions)}</span>
                </div>
                <div>
                    <span className="text-muted block">Net payable</span>
                    <span className="font-semibold text-success">{formatInr(calculated.netPayable)}</span>
                </div>
            </div>
        </div>
    );
};

export default TrainerFeeLineEditor;
