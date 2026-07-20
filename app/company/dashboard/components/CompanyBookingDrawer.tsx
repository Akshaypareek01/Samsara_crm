"use client";

import React, { useEffect, useState } from "react";
import TrainerService, { Trainer, isTrainerAcceptingBookings } from "@/services/trainerService";
import companyService from "@/services/companyService";
import bookingService, { CreateBookingRequest } from "@/services/bookingService";
import { clearCompanyInsightsCache } from "@/services/companyInsightsClient";
import Swal from "sweetalert2";
import CompanyRightDrawer from "./CompanyRightDrawer";
import CompanyBookingTrainerPreview from "./CompanyBookingTrainerPreview";
import { getTrainerBookableTrainingTypes } from "./companyTrainerProfileUtils";
import BookingStartTimeField, {
  isWithinWeeklyAvailability,
} from "@/shared/components/booking/BookingStartTimeField";
import {
  AVAILABILITY_ERROR_MESSAGE,
  mapBookingAvailabilityError,
} from "@/shared/utils/trainerAvailabilityUtils";
import { getMinBookingDate, isBookingDateAllowed } from "@/shared/utils/bookingUtils";
import "./company-booking-drawer.css";

export type CompanyBookingDrawerProps = {
    trainer: Trainer | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

/**
 * Company booking drawer with trainer preview (details + gallery) and booking form.
 */
const CompanyBookingDrawer: React.FC<CompanyBookingDrawerProps> = ({
    trainer,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [formData, setFormData] = useState<CreateBookingRequest>({
        company: "",
        trainer: "",
        bookingDate: "",
        startTime: "",
        duration: 2,
        employeeCount: 0,
        typeOfTraining: [],
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [displayTrainer, setDisplayTrainer] = useState<Trainer | null>(null);
    const [loadingTrainer, setLoadingTrainer] = useState(false);

    const minBookingDate = getMinBookingDate();

    useEffect(() => {
        if (!isOpen || !trainer) {
            setDisplayTrainer(null);
            return;
        }

        setDisplayTrainer(trainer);

        const load = async () => {
            try {
                setLoadingTrainer(true);
                const companyProfile = await companyService.getCompanyProfile();
                const trainerId = trainer._id || trainer.id;
                let full = trainer;
                if (trainerId) {
                    try {
                        full = await TrainerService.getTrainerById(trainerId);
                    } catch {
                        full = trainer;
                    }
                }
                setDisplayTrainer(full);
                setFormData({
                    company: companyProfile._id || companyProfile.id || "",
                    trainer: trainerId || "",
                    bookingDate: "",
                    startTime: "",
                    duration: 2,
                    employeeCount: 0,
                    typeOfTraining: [],
                    notes: "",
                });
            } catch (error) {
                console.error("Error loading booking drawer data:", error);
            } finally {
                setLoadingTrainer(false);
            }
        };

        void load();
    }, [isOpen, trainer]);

    const handleTrainingTypeToggle = (type: string) => {
        setFormData((prev) => {
            const types = prev.typeOfTraining.includes(type)
                ? prev.typeOfTraining.filter((t) => t !== type)
                : [...prev.typeOfTraining, type];
            return { ...prev, typeOfTraining: types };
        });
    };

    const validateForm = (): boolean => {
        if (!formData.bookingDate) {
            void Swal.fire({ icon: "warning", title: "Validation Error", text: "Please select a date" });
            return false;
        }
        if (!isBookingDateAllowed(formData.bookingDate)) {
            void Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Booking date must be tomorrow or later",
            });
            return false;
        }
        if (!formData.startTime) {
            void Swal.fire({ icon: "warning", title: "Validation Error", text: "Please select a time" });
            return false;
        }
        if (formData.duration < 0.5 || formData.duration > 24) {
            void Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Duration must be between 0.5 and 24 hours",
            });
            return false;
        }
        if (!Number.isInteger(formData.employeeCount) || formData.employeeCount < 1) {
            void Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Enter how many employees will attend (minimum 1)",
            });
            return false;
        }
        if (formData.typeOfTraining.length === 0) {
            void Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Please select at least one training type",
            });
            return false;
        }
        const bookingDateTime = new Date(`${formData.bookingDate}T${formData.startTime}`);
        if (bookingDateTime <= new Date()) {
            void Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: "Booking date and time must be in the future",
            });
            return false;
        }
        const availTrainer = displayTrainer ?? trainer;
        if (
            availTrainer?.weeklyAvailability?.length &&
            !isWithinWeeklyAvailability(
                availTrainer.weeklyAvailability,
                formData.bookingDate,
                formData.startTime,
                formData.duration
            )
        ) {
            void Swal.fire({
                icon: "warning",
                title: "Validation Error",
                text: AVAILABILITY_ERROR_MESSAGE,
            });
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!isTrainerAcceptingBookings(displayTrainer ?? trainer)) {
            void Swal.fire({
                icon: "info",
                title: "Not available",
                text: "This trainer is not accepting new bookings right now.",
            });
            return;
        }

        try {
            setLoading(true);
            await bookingService.createBooking(formData);
            clearCompanyInsightsCache();
            void Swal.fire({
                icon: "success",
                title: "Booking Created!",
                text: "Your booking has been submitted and is waiting for trainer approval.",
                confirmButtonText: "OK",
            });
            onClose();
            onSuccess?.();
        } catch (error: unknown) {
            const msg =
                mapBookingAvailabilityError(error) ||
                (error instanceof Error ? error.message : "Failed to create booking. Please try again.");
            void Swal.fire({ icon: "error", title: "Booking Failed", text: msg });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !trainer) return null;

    const previewTrainer = displayTrainer ?? trainer;
    const availableTypes = getTrainerBookableTrainingTypes(previewTrainer);
    const canAcceptNewBookings = isTrainerAcceptingBookings(previewTrainer);

    const footer = (
        <div className="flex flex-col sm:flex-row gap-2">
            <button
                type="submit"
                form="company-booking-drawer-form"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-white text-sm font-semibold py-3 hover:opacity-90 transition-colors disabled:opacity-50"
                disabled={loading || !canAcceptNewBookings}
            >
                {loading ? (
                    <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
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
                disabled={loading}
            >
                Cancel
            </button>
        </div>
    );

    return (
        <CompanyRightDrawer
            open={isOpen}
            title={`Book session — ${previewTrainer.name}`}
            onClose={onClose}
            maxWidthClass="max-w-5xl"
            flushBody
            stacked
            ariaLabelledBy="company-booking-drawer-title"
            footer={footer}
        >
            <div className="company-booking-drawer__layout">
                <div className="company-booking-drawer__preview-col">
                    {loadingTrainer ? (
                        <div className="flex justify-center py-16">
                            <div className="spinner-border text-primary" style={{ color: "#ed662e" }} role="status">
                                <span className="visually-hidden">Loading trainer…</span>
                            </div>
                        </div>
                    ) : (
                        <CompanyBookingTrainerPreview trainer={previewTrainer} />
                    )}
                </div>

                <div className="company-booking-drawer__form-col">
                    <h3 className="company-booking-drawer__form-title">Session details</h3>
                    <form id="company-booking-drawer-form" onSubmit={handleSubmit} className="company-booking-drawer__form">
                        {!canAcceptNewBookings && (
                            <div className="company-booking-drawer__alert" role="alert">
                                This trainer is not accepting new bookings at the moment.
                            </div>
                        )}

                        <div className="company-booking-drawer__form-row">
                            <div className="company-booking-drawer__field">
                                <label className="company-booking-drawer__label" htmlFor="booking-date">
                                    Booking date <span className="company-booking-drawer__required">*</span>
                                </label>
                                <input
                                    id="booking-date"
                                    type="date"
                                    className="company-booking-drawer__input"
                                    value={formData.bookingDate}
                                    min={minBookingDate}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, bookingDate: e.target.value }))
                                    }
                                    disabled={!canAcceptNewBookings}
                                    required
                                    aria-describedby="booking-date-hint"
                                />
                                <p id="booking-date-hint" className="company-booking-drawer__hint">
                                    Earliest available date is tomorrow
                                </p>
                            </div>
                            <div className="company-booking-drawer__field">
                                <BookingStartTimeField
                                    id="booking-time"
                                    bookingDate={formData.bookingDate}
                                    startTime={formData.startTime}
                                    durationHours={formData.duration}
                                    weeklyAvailability={previewTrainer.weeklyAvailability}
                                    disabled={!canAcceptNewBookings}
                                    labelClassName="company-booking-drawer__label"
                                    inputClassName="company-booking-drawer__input"
                                    hintClassName="company-booking-drawer__hint"
                                    warningHintClassName="company-booking-drawer__hint company-booking-drawer__hint--warning"
                                    requiredMarkClassName="company-booking-drawer__required"
                                    onChange={(time) =>
                                        setFormData((prev) => ({ ...prev, startTime: time }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="company-booking-drawer__field">
                            <label className="company-booking-drawer__label" htmlFor="booking-duration">
                                Duration (hours) <span className="company-booking-drawer__required">*</span>
                            </label>
                            <input
                                id="booking-duration"
                                type="number"
                                className="company-booking-drawer__input"
                                value={formData.duration}
                                min={0.5}
                                max={24}
                                step={0.5}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        duration: parseFloat(e.target.value),
                                    }))
                                }
                                disabled={!canAcceptNewBookings}
                                required
                                aria-describedby="booking-duration-hint"
                            />
                            <p id="booking-duration-hint" className="company-booking-drawer__hint">
                                Between 0.5 and 24 hours
                            </p>
                        </div>

                        <div className="company-booking-drawer__field">
                            <label className="company-booking-drawer__label" htmlFor="booking-employees">
                                Employees attending <span className="company-booking-drawer__required">*</span>
                            </label>
                            <input
                                id="booking-employees"
                                type="number"
                                className="company-booking-drawer__input"
                                value={formData.employeeCount || ""}
                                min={1}
                                step={1}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        employeeCount: parseInt(e.target.value, 10) || 0,
                                    }))
                                }
                                disabled={!canAcceptNewBookings}
                                placeholder="e.g. 25"
                                required
                                aria-describedby="booking-employees-hint"
                            />
                            <p id="booking-employees-hint" className="company-booking-drawer__hint">
                                How many employees will join this session?
                            </p>
                        </div>

                        <div className="company-booking-drawer__field">
                            <span className="company-booking-drawer__label" id="booking-types-label">
                                Training types <span className="company-booking-drawer__required">*</span>
                            </span>
                            {availableTypes.length === 0 ? (
                                <p className="company-booking-drawer__hint mb-0">
                                    No training types available for this trainer.
                                </p>
                            ) : (
                                <div
                                    className="company-booking-drawer__types-panel"
                                    role="group"
                                    aria-labelledby="booking-types-label"
                                >
                                    {availableTypes.map((type) => (
                                        <div key={type} className="company-booking-drawer__check">
                                            <input
                                                type="checkbox"
                                                className="company-booking-drawer__checkbox"
                                                id={`drawer-type-${type}`}
                                                checked={formData.typeOfTraining.includes(type)}
                                                onChange={() => handleTrainingTypeToggle(type)}
                                                disabled={!canAcceptNewBookings}
                                            />
                                            <label className="company-booking-drawer__check-label" htmlFor={`drawer-type-${type}`}>
                                                {type}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="company-booking-drawer__hint">
                                Selected: {formData.typeOfTraining.length}
                            </p>
                        </div>

                        <div className="company-booking-drawer__field">
                            <label className="company-booking-drawer__label" htmlFor="booking-notes">
                                Notes <span className="company-booking-drawer__optional">(optional)</span>
                            </label>
                            <textarea
                                id="booking-notes"
                                className="company-booking-drawer__input company-booking-drawer__textarea"
                                rows={3}
                                value={formData.notes}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                                }
                                placeholder="Special requirements or notes…"
                                disabled={!canAcceptNewBookings}
                            />
                        </div>
                    </form>
                </div>
            </div>
        </CompanyRightDrawer>
    );
};

export default CompanyBookingDrawer;
