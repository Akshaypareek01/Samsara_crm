"use client";

import React from "react";
import type { WeeklyAvailabilityDay } from "@/shared/utils/trainerAvailabilityUtils";
import {
  getAvailableStartTimesForDate,
  isWithinWeeklyAvailability,
} from "@/shared/utils/trainerAvailabilityUtils";
import { formatBookingTime } from "@/shared/utils/bookingUtils";

type BookingStartTimeFieldProps = {
  id: string;
  bookingDate: string;
  startTime: string;
  durationHours: number;
  weeklyAvailability?: WeeklyAvailabilityDay[];
  disabled?: boolean;
  onChange: (time: string) => void;
  error?: string;
  labelClassName?: string;
  inputClassName?: string;
  hintClassName?: string;
  warningHintClassName?: string;
  requiredMarkClassName?: string;
};

/**
 * Start-time input that prefers trainer availability slots when a date is selected.
 */
const BookingStartTimeField: React.FC<BookingStartTimeFieldProps> = ({
  id,
  bookingDate,
  startTime,
  durationHours,
  weeklyAvailability,
  disabled = false,
  onChange,
  error,
  labelClassName = "form-label",
  inputClassName = "form-control",
  hintClassName = "text-warning d-block mt-1",
  warningHintClassName,
  requiredMarkClassName = "text-danger",
}) => {
  const availabilityHintClass = warningHintClassName ?? hintClassName;
  const slotOptions =
    bookingDate && weeklyAvailability?.length
      ? getAvailableStartTimesForDate(weeklyAvailability, bookingDate, durationHours)
      : [];

  const showSlotSelect = slotOptions.length > 0;

  return (
    <div>
      <label className={labelClassName} htmlFor={id}>
        Start time <span className={requiredMarkClassName}>*</span>
      </label>
      {showSlotSelect ? (
        <select
          id={id}
          className={`${inputClassName} ${error ? "is-invalid" : ""}`}
          value={startTime}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        >
          <option value="">Select a time slot</option>
          {slotOptions.map((time) => (
            <option key={time} value={time}>
              {formatBookingTime(time)}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type="time"
          className={`${inputClassName} ${error ? "is-invalid" : ""}`}
          value={startTime}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      {weeklyAvailability?.length && bookingDate && slotOptions.length === 0 && (
        <small className={availabilityHintClass}>
          No availability on this day. Choose another date.
        </small>
      )}
      {error && (
        <div id={`${id}-error`} className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
};

export { isWithinWeeklyAvailability };
export default BookingStartTimeField;
