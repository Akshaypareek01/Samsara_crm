"use client";

import React from "react";
import CompanyRightDrawer from "./CompanyRightDrawer";
import BookingSessionRow from "./BookingSessionRow";
import { useBookingSessionForm } from "../hooks/useBookingSessionForm";
import { clearCompanyInsightsCache } from "@/services/companyInsightsClient";
import { mapBookingAvailabilityError } from "@/shared/utils/trainerAvailabilityUtils";
import Swal from "sweetalert2";
import "./company-booking-drawer.css";

export type CompanyMultiSessionBookingDrawerProps = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

/**
 * Drawer for creating a same-day booking with multiple trainers and sessions.
 */
const CompanyMultiSessionBookingDrawer: React.FC<CompanyMultiSessionBookingDrawerProps> = ({
    isOpen,
    onClose,
    onSuccess,
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
    } = useBookingSessionForm({ isOpen });

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
            onClose();
            onSuccess?.();
        } catch (error: unknown) {
            const msg =
                mapBookingAvailabilityError(error) ||
                (error instanceof Error ? error.message : "Failed to create booking.");
            void Swal.fire({ icon: "error", title: "Booking Failed", text: msg });
        }
    };

    if (!isOpen) return null;

    const footer = (
        <div className="flex flex-col sm:flex-row gap-2">
            <button
                type="submit"
                form="company-multi-session-booking-form"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold py-3 hover:opacity-90 transition-colors disabled:opacity-50"
                disabled={submitting || loadingTrainers}
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
            <button
                type="button"
                className="flex-1 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold py-3 hover:bg-gray-50 transition-colors"
                onClick={onClose}
                disabled={submitting}
            >
                Cancel
            </button>
        </div>
    );

    return (
        <CompanyRightDrawer
            open={isOpen}
            title="New multi-session booking"
            onClose={onClose}
            maxWidthClass="max-w-3xl"
            flushBody
            ariaLabelledBy="company-multi-session-booking-title"
            footer={footer}
        >
            {loadingTrainers ? (
                <div className="flex justify-center py-16">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading trainers…</span>
                    </div>
                </div>
            ) : (
                <form
                    id="company-multi-session-booking-form"
                    onSubmit={handleSubmit}
                    className="company-booking-drawer__form p-4"
                >
                    <p className="text-sm text-muted mb-4">
                        Book multiple trainers on the same day in one booking. Each trainer
                        approves their session independently.
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

                    <div className="company-booking-drawer__field">
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
                </form>
            )}
        </CompanyRightDrawer>
    );
};

export default CompanyMultiSessionBookingDrawer;
