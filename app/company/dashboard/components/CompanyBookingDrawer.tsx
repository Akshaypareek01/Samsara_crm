"use client";

import React, { useEffect, useState } from "react";
import { Trainer, isTrainerAcceptingBookings } from "@/services/trainerService";
import companyService from "@/services/companyService";
import bookingService, { CreateBookingRequest } from "@/services/bookingService";
import { clearCompanyInsightsCache } from "@/services/companyInsightsClient";
import Swal from "sweetalert2";
import CompanyRightDrawer from "./CompanyRightDrawer";
import { getTrainerBookableTrainingTypes } from "./companyTrainerProfileUtils";

export type CompanyBookingDrawerProps = {
    trainer: Trainer | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

/**
 * Company booking form in a right-side drawer.
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

    const getMinDate = () => new Date().toISOString().split("T")[0];

    useEffect(() => {
        if (isOpen && trainer) {
            const loadCompanyData = async () => {
                try {
                    const companyProfile = await companyService.getCompanyProfile();
                    setFormData({
                        company: companyProfile._id || companyProfile.id || "",
                        trainer: trainer._id || trainer.id || "",
                        bookingDate: "",
                        startTime: "",
                        duration: 2,
                        typeOfTraining: [],
                        notes: "",
                    });
                } catch (error) {
                    console.error("Error loading company data:", error);
                }
            };
            void loadCompanyData();
        }
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
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        if (!isTrainerAcceptingBookings(trainer)) {
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
                text: "Your booking has been submitted and is waiting for admin approval.",
                confirmButtonText: "OK",
            });
            onClose();
            onSuccess?.();
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Failed to create booking. Please try again.";
            void Swal.fire({ icon: "error", title: "Booking Failed", text: msg });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !trainer) return null;

    const availableTypes = getTrainerBookableTrainingTypes(trainer);
    const canAcceptNewBookings = isTrainerAcceptingBookings(trainer);

    const footer = (
        <div className="flex flex-col gap-2">
            <button
                type="submit"
                form="company-booking-drawer-form"
                className="ti-btn ti-btn-primary !m-0 !float-none w-full inline-flex items-center justify-center gap-2 !px-4 !py-2.5 text-sm font-semibold min-h-[2.75rem] rounded-lg shadow-none"
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
                className="ti-btn ti-btn-light !m-0 !float-none w-full inline-flex items-center justify-center !px-4 !py-2.5 text-sm font-semibold min-h-[2.5rem] rounded-lg border border-defaultborder shadow-none"
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
            title={`Book session — ${trainer.name}`}
            onClose={onClose}
            maxWidthClass="max-w-lg"
            ariaLabelledBy="company-booking-drawer-title"
            footer={footer}
        >
            <form id="company-booking-drawer-form" onSubmit={handleSubmit} className="space-y-4">
                {!canAcceptNewBookings && (
                    <div className="alert alert-warning mb-0" role="alert">
                        This trainer is not accepting new bookings at the moment.
                    </div>
                )}

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-center gap-3">
                        {trainer.profilePhoto?.path ? (
                            <img
                                src={trainer.profilePhoto.path}
                                alt=""
                                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div
                                className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0"
                                aria-hidden="true"
                            >
                                <span className="text-primary font-semibold text-xl">
                                    {trainer.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="font-semibold text-defaulttextcolor mb-0 truncate">{trainer.name}</p>
                            <p className="text-sm text-muted mb-0 truncate">{trainer.title}</p>
                        </div>
                    </div>
                </div>

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
                            onChange={(e) => setFormData((prev) => ({ ...prev, bookingDate: e.target.value }))}
                            disabled={!canAcceptNewBookings}
                            required
                        />
                    </div>
                    <div>
                        <label className="form-label" htmlFor="booking-time">
                            Start time <span className="text-danger">*</span>
                        </label>
                        <input
                            id="booking-time"
                            type="time"
                            className="form-control"
                            value={formData.startTime}
                            onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                            disabled={!canAcceptNewBookings}
                            required
                        />
                    </div>
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
                            setFormData((prev) => ({ ...prev, duration: parseFloat(e.target.value) }))
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
                        <p className="text-sm text-muted mb-0">No training types available for this trainer.</p>
                    ) : (
                        <div className="border border-defaultborder rounded-lg p-3 max-h-[200px] overflow-y-auto">
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
                    <small className="text-muted">Selected: {formData.typeOfTraining.length}</small>
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
                        onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                        placeholder="Special requirements or notes…"
                        disabled={!canAcceptNewBookings}
                    />
                </div>
            </form>
        </CompanyRightDrawer>
    );
};

export default CompanyBookingDrawer;
