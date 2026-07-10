"use client";

import React from "react";
import BookingSessionRow from "./BookingSessionRow";
import { useBookingSessionForm } from "../hooks/useBookingSessionForm";
import { clearCompanyInsightsCache } from "@/services/companyInsightsClient";
import { mapBookingAvailabilityError } from "@/shared/utils/trainerAvailabilityUtils";
import Swal from "sweetalert2";
import "./company-booking-drawer.css";
import "../bookings/new/company-booking-page.css";

export type CompanyMultiSessionBookingFormProps = {
    initialTrainerId?: string;
    returnTo?: string;
    onSuccess?: () => void;
    onCancel?: () => void;
    showPageActions?: boolean;
};

/**
 * Multi-session booking form for the dedicated booking page.
 */
const CompanyMultiSessionBookingForm: React.FC<CompanyMultiSessionBookingFormProps> = ({
    initialTrainerId = "",
    returnTo = "/company/dashboard/bookings/new",
    onSuccess,
    onCancel,
    showPageActions = true,
}) => {
    const {
        bookingDate,
        setBookingDate,
        notes,
        setNotes,
        sessions,
        updateSession,
        addSession,
        removeSession,
        loadingTrainers,
        submitting,
        availability,
        checkingAvailability,
        minBookingDate,
        maxSessions,
        getAvailableTrainersForRow,
        validate,
        submit,
        trainerMap,
    } = useBookingSessionForm({ enabled: true, initialTrainerId });

    const presetTrainer = initialTrainerId ? trainerMap.get(initialTrainerId) : undefined;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validate();
        if (validationError) {
            void Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: validationError,
            });
            return;
        }

        try {
            await submit();
            clearCompanyInsightsCache();
            void Swal.fire({
                icon: "success",
                title: "Booking Created!",
                text: "Your multi-session booking has been submitted. Trainers will be notified to approve their sessions.",
                confirmButtonText: "OK",
            });
            onSuccess?.();
        } catch (error: unknown) {
            const msg =
                mapBookingAvailabilityError(error) ||
                (error instanceof Error ? error.message : "Failed to create booking.");
            void Swal.fire({ icon: "error", title: "Booking Failed", text: msg });
        }
    };

    if (loadingTrainers) {
        return (
            <div className="flex justify-center py-16">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading trainers…</span>
                </div>
            </div>
        );
    }

    return (
        <form
            id="company-multi-session-booking-form"
            onSubmit={handleSubmit}
            className="company-booking-page__form"
        >
            {presetTrainer && (
                <div className="company-booking-page__preset mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">
                        Pre-selected trainer
                    </p>
                    <div className="flex items-center gap-3">
                        {presetTrainer.profilePhoto?.path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={presetTrainer.profilePhoto.path}
                                alt=""
                                className="w-11 h-11 rounded-full object-cover border border-primary/20"
                            />
                        ) : (
                            <span className="w-11 h-11 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center">
                                {presetTrainer.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <div>
                            <p className="text-sm font-semibold mb-0">{presetTrainer.name}</p>
                            <p className="text-xs text-muted mb-0">{presetTrainer.title}</p>
                        </div>
                    </div>
                </div>
            )}

            <p className="text-sm text-muted mb-4">
                Book multiple trainers on the same day in one booking. Each trainer approves their
                session independently.
            </p>

            <div className="company-booking-drawer__field mb-4">
                <label className="company-booking-drawer__label" htmlFor="multi-booking-date">
                    Booking date <span className="company-booking-drawer__required">*</span>
                </label>
                <input
                    id="multi-booking-date"
                    type="date"
                    className="company-booking-drawer__input"
                    value={bookingDate}
                    min={minBookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    required
                    aria-describedby="multi-booking-date-hint"
                />
                <p id="multi-booking-date-hint" className="company-booking-drawer__hint">
                    All sessions share this date. Earliest is tomorrow.
                </p>
            </div>

            <div className="space-y-4 mb-4">
                {sessions.map((row, index) => (
                    <BookingSessionRow
                        key={row.key}
                        index={index}
                        row={row}
                        trainers={getAvailableTrainersForRow(row.key)}
                        canRemove={sessions.length > 1}
                        availability={availability.find((a) => a.index === index)}
                        checkingAvailability={checkingAvailability}
                        onUpdate={updateSession}
                        onRemove={removeSession}
                        bookingDate={bookingDate}
                        returnTo={returnTo}
                        selectedTrainer={trainerMap.get(row.trainerId) ?? null}
                    />
                ))}
            </div>

            {sessions.length < maxSessions && (
                <button
                    type="button"
                    className="ti-btn ti-btn-light border border-defaultborder mb-4 w-full"
                    onClick={addSession}
                    aria-label="Add another session"
                >
                    <i className="ri-add-line me-1" aria-hidden="true" />
                    Add another session
                </button>
            )}

            <div className="company-booking-drawer__field mb-6">
                <label className="company-booking-drawer__label" htmlFor="multi-booking-notes">
                    Notes <span className="company-booking-drawer__optional">(optional)</span>
                </label>
                <textarea
                    id="multi-booking-notes"
                    className="company-booking-drawer__input company-booking-drawer__textarea"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special requirements for all sessions…"
                />
            </div>

            {showPageActions && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        type="submit"
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold py-3 hover:opacity-90 transition-colors disabled:opacity-50"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                                Creating…
                            </>
                        ) : (
                            "Create Booking"
                        )}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold py-3 hover:bg-gray-50 transition-colors"
                            onClick={onCancel}
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            )}
        </form>
    );
};

export default CompanyMultiSessionBookingForm;
