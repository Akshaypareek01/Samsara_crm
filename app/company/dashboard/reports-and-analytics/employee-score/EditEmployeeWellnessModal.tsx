"use client";

import React, { useEffect, useState } from "react";
import companyService from "@/services/companyService";
import { clearCompanyInsightsCache } from "@/services/companyInsightsClient";
import { wellnessStatusToApi, STATUS_FILTERS, type Employee, type EmployeeStatus } from "../_data/employee-score-data";

export interface EditEmployeeWellnessModalProps {
    /** When set, modal is shown for this row. */
    employee: Employee | null;
    onClose: () => void;
    /** Called after a successful PATCH so the parent can refetch. */
    onSaved: () => Promise<void> | void;
}

/**
 * Dialog to PATCH portal employee `department`, `level`, and wellness `status` from scorecard labels.
 */
export function EditEmployeeWellnessModal({ employee, onClose, onSaved }: EditEmployeeWellnessModalProps) {
    const [editDept, setEditDept] = useState("");
    const [editStatus, setEditStatus] = useState<EmployeeStatus>("Fair");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (employee) {
            setEditDept(employee.department);
            setEditStatus(employee.status);
        }
    }, [employee]);

    if (!employee) return null;

    const save = async () => {
        setSaving(true);
        try {
            const { level, status } = wellnessStatusToApi(editStatus);
            await companyService.updatePortalEmployee(employee.id, {
                department: editDept.trim() || "Wellness",
                level,
                status,
            });
            clearCompanyInsightsCache();
            await onSaved();
            onClose();
            alert("Employee updated.");
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Update failed";
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-employee-title"
        >
            <div className="bg-white dark:bg-bodybg rounded-xl shadow-xl w-full max-w-md p-6">
                <h6 id="edit-employee-title" className="text-base font-semibold mb-4">
                    Edit employee wellness
                </h6>
                <p className="text-sm text-muted mb-3">{employee.name}</p>
                <div className="flex flex-col gap-3">
                    <div>
                        <label htmlFor="edit-dept" className="block text-xs font-medium mb-1">
                            Department
                        </label>
                        <input
                            id="edit-dept"
                            className="form-control text-sm"
                            value={editDept}
                            onChange={(e) => setEditDept(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="edit-status" className="block text-xs font-medium mb-1">
                            Wellness status
                        </label>
                        <select
                            id="edit-status"
                            className="form-select text-sm"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value as EmployeeStatus)}
                        >
                            {STATUS_FILTERS.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" className="ti-btn ti-btn-light ti-btn-sm" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="ti-btn ti-btn-primary ti-btn-sm"
                        disabled={saving}
                        onClick={() => void save()}
                    >
                        {saving ? "Saving…" : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
