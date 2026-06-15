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
        typeOfTraining: [],
        notes: "",
    });
    const [loading, setLoading] = useState(false);
    const [displayTrainer, setDisplayTrainer] = useState<Trainer | null>(null);
    const [loadingTrainer, setLoadingTrainer] = useState(false);

    const getMinDate = () => new Date().toISOString().split("T")[0];

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
                    <form id="company-booking-drawer-form" onSubmit={handleSubmit} className="space-y-4">
                        {!canAcceptNewBookings && (
                            <div className="alert alert-warning mb-0" role="alert">
                                This trainer is not accepting new bookings at the moment.
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label" htmlFor="booking-date">
                                    Booking date <span className="text-danger">*</span>
                                </label>
                                <input
                                    id="booking-date"
                                    type="date"
                                    className="form-control"
                                    value={formData.bookingDate}
                                    min={getMinDate()}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, bookingDate: e.target.value }))
                                    }
                                    disabled={!canAcceptNewBookings}
                                    required
                                />
                            </div>
                            <BookingStartTimeField
                                id="booking-time"
                                bookingDate={formData.bookingDate}
                                startTime={formData.startTime}
                                durationHours={formData.duration}
                                weeklyAvailability={previewTrainer.weeklyAvailability}
                                disabled={!canAcceptNewBookings}
                                onChange={(time) =>
                                    setFormData((prev) => ({ ...prev, startTime: time }))
                                }
                            />
                        </div>

                        <div>
                            <label className="form-label" htmlFor="booking-duration">
                                Duration (hours) <span className="text-danger">*</span>
                            </label>
                            <input
                                id="booking-duration"
                                type="number"
                                className="form-control"
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
                            />
                            <small className="text-muted">Between 0.5 and 24 hours</small>
                        </div>

                        <div>
                            <label className="form-label">
                                Training types <span className="text-danger">*</span>
                            </label>
                            {availableTypes.length === 0 ? (
                                <p className="text-sm text-muted mb-0">
                                    No training types available for this trainer.
                                </p>
                            ) : (
                                <div className="border border-defaultborder rounded-lg p-3 max-h-[180px] overflow-y-auto">
                                    {availableTypes.map((type) => (
                                        <div key={type} className="form-check mb-2 last:mb-0">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                id={`drawer-type-${type}`}
                                                checked={formData.typeOfTraining.includes(type)}
                                                onChange={() => handleTrainingTypeToggle(type)}
                                                disabled={!canAcceptNewBookings}
                                            />
                                            <label className="form-check-label" htmlFor={`drawer-type-${type}`}>
                                                {type}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <small className="text-muted">
                                Selected: {formData.typeOfTraining.length}
                            </small>
                        </div>

                        <div>
                            <label className="form-label" htmlFor="booking-notes">
                                Notes (optional)
                            </label>
                            <textarea
                                id="booking-notes"
                                className="form-control"
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
