"use client";

import React from "react";
import type { Trainer } from "@/services/trainerService";
import type { CheckAvailabilityResult } from "@/services/bookingService";
import type { SessionFormRow } from "../hooks/useBookingSessionForm";
import BookingStartTimeField from "@/shared/components/booking/BookingStartTimeField";
import { getTrainerBookableTrainingTypes } from "./companyTrainerProfileUtils";

export type BookingSessionRowProps = {
    index: number;
    row: SessionFormRow;
    trainers: Trainer[];
    bookingDate: string;
    canRemove: boolean;
    availability?: CheckAvailabilityResult;
    checkingAvailability?: boolean;
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
    onUpdate,
    onRemove,
}) => {
    const selectedTrainer = trainers.find(
        (t) => (t._id || t.id) === row.trainerId
    );
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
                    <label
                        className="form-label text-sm font-medium"
                        htmlFor={`session-trainer-${row.key}`}
                    >
                        Trainer <span className="text-danger">*</span>
                    </label>
                    <select
                        id={`session-trainer-${row.key}`}
                        className="form-control"
                        value={row.trainerId}
                        onChange={(e) =>
                            onUpdate(row.key, {
                                trainerId: e.target.value,
                                typeOfTraining: [],
                                startTime: "",
                            })
                        }
                        required
                        aria-label={`Trainer for session ${index + 1}`}
                    >
                        <option value="">Select trainer</option>
                        {trainers.map((t) => {
                            const id = t._id || t.id || "";
                            return (
                                <option key={id} value={id}>
                                    {t.name}
                                    {t.specialistIn?.length
                                        ? ` — ${Array.isArray(t.specialistIn) ? t.specialistIn.join(", ") : t.specialistIn}`
                                        : ""}
                                </option>
                            );
                        })}
                    </select>
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
    );
};

export default BookingSessionRow;
