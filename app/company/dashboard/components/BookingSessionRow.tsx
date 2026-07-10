"use client";

import React, { useState } from "react";
import type { Trainer } from "@/services/trainerService";
import type { CheckAvailabilityResult } from "@/services/bookingService";
import type { SessionFormRow } from "../hooks/useBookingSessionForm";
import BookingStartTimeField from "@/shared/components/booking/BookingStartTimeField";
import { getTrainerBookableTrainingTypes } from "./companyTrainerProfileUtils";
import CompanyTrainerPickerDrawer from "./CompanyTrainerPickerDrawer";

export type BookingSessionRowProps = {
    index: number;
    row: SessionFormRow;
    trainers: Trainer[];
    bookingDate: string;
    canRemove: boolean;
    availability?: CheckAvailabilityResult;
    checkingAvailability?: boolean;
    returnTo?: string;
    selectedTrainer?: Trainer | null;
    onUpdate: (key: string, patch: Partial<SessionFormRow>) => void;
    onRemove: (key: string) => void;
};

/**
 * One editable session row in the multi-session booking form.
 */
const BookingSessionRow: React.FC<BookingSessionRowProps> = ({
    index,
    row,
    trainers,
    bookingDate,
    canRemove,
    availability,
    checkingAvailability = false,
    returnTo = "/company/dashboard/bookings/new",
    selectedTrainer: selectedTrainerProp,
    onUpdate,
    onRemove,
}) => {
    const [pickerOpen, setPickerOpen] = useState(false);

    const selectedTrainer =
        selectedTrainerProp ||
        trainers.find((t) => (t._id || t.id) === row.trainerId);
    const trainingTypes = selectedTrainer
        ? getTrainerBookableTrainingTypes(selectedTrainer)
        : [];

    const handleTypeToggle = (type: string) => {
        const types = row.typeOfTraining.includes(type)
            ? row.typeOfTraining.filter((t) => t !== type)
            : [...row.typeOfTraining, type];
        onUpdate(row.key, { typeOfTraining: types });
    };

    const availClass =
        availability?.available === false
            ? "border-danger/40 bg-danger/5"
            : availability?.available
              ? "border-success/30"
              : "border-defaultborder";

    return (
        <>
        <section
            className={`rounded-lg border p-4 ${availClass}`}
            aria-label={`Session ${index + 1}`}
        >
            <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-semibold text-defaulttextcolor mb-0">
                    Session {index + 1}
                </h4>
                {canRemove && (
                    <button
                        type="button"
                        className="ti-btn ti-btn-sm ti-btn-danger-outline !py-1 !px-2"
                        onClick={() => onRemove(row.key)}
                        aria-label={`Remove session ${index + 1}`}
                    >
                        <i className="ri-delete-bin-line" aria-hidden="true" />
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                    <span className="form-label text-sm font-medium block mb-2">
                        Trainer <span className="text-danger">*</span>
                    </span>
                    {selectedTrainer ? (
                        <div className="flex items-center gap-3 rounded-lg border border-defaultborder p-3 bg-light/30">
                            {selectedTrainer.profilePhoto?.path ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={selectedTrainer.profilePhoto.path}
                                    alt=""
                                    className="w-10 h-10 rounded-full object-cover border border-primary/20 shrink-0"
                                />
                            ) : (
                                <span className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center shrink-0">
                                    {selectedTrainer.name.charAt(0).toUpperCase()}
                                </span>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold mb-0 truncate">
                                    {selectedTrainer.name}
                                </p>
                                <p className="text-xs text-muted mb-0 truncate">
                                    {selectedTrainer.title}
                                </p>
                            </div>
                            <button
                                type="button"
                                className="company-booking-session__change-trainer-btn shrink-0"
                                onClick={() => setPickerOpen(true)}
                                aria-label={`Change trainer for session ${index + 1}`}
                            >
                                Change
                            </button>
                        </div>
                    ) : (
                        <button
                            type="button"
                            className="company-booking-session__select-trainer-btn w-full"
                            onClick={() => setPickerOpen(true)}
                            aria-label={`Select trainer for session ${index + 1}`}
                        >
                            <i className="ri-user-search-line" aria-hidden="true" />
                            Select trainer
                        </button>
                    )}
                    <input
                        type="hidden"
                        name={`session-trainer-${row.key}`}
                        value={row.trainerId}
                        readOnly
                        aria-hidden="true"
                        tabIndex={-1}
                    />
                </div>

                <div>
                    <BookingStartTimeField
                        id={`session-time-${row.key}`}
                        bookingDate={bookingDate}
                        startTime={row.startTime}
                        durationHours={row.duration}
                        weeklyAvailability={selectedTrainer?.weeklyAvailability}
                        disabled={!row.trainerId}
                        labelClassName="form-label text-sm font-medium"
                        inputClassName="form-control"
                        hintClassName="text-xs text-muted mt-1"
                        warningHintClassName="text-xs text-warning mt-1"
                        requiredMarkClassName="text-danger"
                        onChange={(time) => onUpdate(row.key, { startTime: time })}
                    />
                </div>

                <div>
                    <label
                        className="form-label text-sm font-medium"
                        htmlFor={`session-duration-${row.key}`}
                    >
                        Duration (hours) <span className="text-danger">*</span>
                    </label>
                    <input
                        id={`session-duration-${row.key}`}
                        type="number"
                        className="form-control"
                        min={0.5}
                        max={24}
                        step={0.5}
                        value={row.duration}
                        onChange={(e) =>
                            onUpdate(row.key, {
                                duration: parseFloat(e.target.value) || 0.5,
                            })
                        }
                        disabled={!row.trainerId}
                        required
                    />
                </div>
            </div>

            {row.trainerId && (
                <div className="mt-3">
                    <span
                        className="form-label text-sm font-medium block"
                        id={`session-types-${row.key}`}
                    >
                        Training types <span className="text-danger">*</span>
                    </span>
                    {trainingTypes.length === 0 ? (
                        <p className="text-xs text-muted mb-0">
                            No training types for this trainer.
                        </p>
                    ) : (
                        <div
                            className="flex flex-wrap gap-2 mt-1"
                            role="group"
                            aria-labelledby={`session-types-${row.key}`}
                        >
                            {trainingTypes.map((type) => (
                                <label
                                    key={type}
                                    className="inline-flex items-center gap-1.5 text-sm cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={row.typeOfTraining.includes(type)}
                                        onChange={() => handleTypeToggle(type)}
                                    />
                                    {type}
                                </label>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {checkingAvailability && row.trainerId && row.startTime && (
                <p className="text-xs text-muted mt-2 mb-0" role="status">
                    Checking availability…
                </p>
            )}
            {availability && !checkingAvailability && (
                <p
                    className={`text-xs mt-2 mb-0 ${availability.available ? "text-success" : "text-danger"}`}
                    role="status"
                >
                    {availability.available
                        ? "Slot available"
                        : availability.reason || "Not available"}
                </p>
            )}
        </section>

        <CompanyTrainerPickerDrawer
            open={pickerOpen}
            trainers={trainers}
            selectedTrainerId={row.trainerId}
            returnTo={returnTo}
            sessionLabel={`session ${index + 1}`}
            onClose={() => setPickerOpen(false)}
            onSelect={(trainerId) =>
                onUpdate(row.key, {
                    trainerId,
                    typeOfTraining: [],
                    startTime: "",
                })
            }
        />
        </>
    );
};

export default BookingSessionRow;
