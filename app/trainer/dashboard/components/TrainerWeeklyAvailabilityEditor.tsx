"use client";

import React, { useEffect, useState } from "react";
import type { WeeklyAvailabilityDay, WeeklyAvailabilitySlot } from "@/shared/utils/trainerAvailabilityUtils";
import { WEEKDAY_LABELS, trainerHasWeeklySchedule } from "@/shared/utils/trainerAvailabilityUtils";
import "./trainer-weekly-availability-editor.css";

type TrainerWeeklyAvailabilityEditorProps = {
  value: WeeklyAvailabilityDay[];
  saving?: boolean;
  onChange: (next: WeeklyAvailabilityDay[]) => void;
  onSave: () => void | Promise<void>;
};

/** Weekdays shown first (Mon–Fri), then weekend. */
const EDITOR_DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/**
 * Build editor state with every weekday present.
 *
 * @param input - Stored weekly availability from the API.
 */
function normalizeSchedule(input: WeeklyAvailabilityDay[] | undefined): WeeklyAvailabilityDay[] {
  return EDITOR_DAY_ORDER.map((dayOfWeek) => {
    const existing = input?.find((entry) => entry.dayOfWeek === dayOfWeek);
    return {
      dayOfWeek,
      slots: existing?.slots?.length ? [...existing.slots] : [],
    };
  });
}

/**
 * Editor for a trainer's recurring weekly availability windows.
 */
const TrainerWeeklyAvailabilityEditor: React.FC<TrainerWeeklyAvailabilityEditorProps> = ({
  value,
  saving = false,
  onChange,
  onSave,
}) => {
  const [schedule, setSchedule] = useState<WeeklyAvailabilityDay[]>(() => normalizeSchedule(value));

  useEffect(() => {
    setSchedule(normalizeSchedule(value));
  }, [value]);

  const hasSavedSchedule = trainerHasWeeklySchedule(value);

  /**
   * Update slots for a weekday and propagate to parent.
   *
   * @param dayOfWeek - Day index (0 = Sunday).
   * @param slots - Updated slot list.
   */
  const updateDaySlots = (dayOfWeek: number, slots: WeeklyAvailabilitySlot[]) => {
    const next = schedule.map((day) =>
      day.dayOfWeek === dayOfWeek ? { ...day, slots } : day
    );
    setSchedule(next);
    onChange(next.filter((day) => day.slots.length > 0));
  };

  /**
   * Append a default slot row for the given weekday.
   *
   * @param dayOfWeek - Day index.
   */
  const addSlot = (dayOfWeek: number) => {
    const day = schedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    updateDaySlots(dayOfWeek, [...day.slots, { startTime: "09:00", endTime: "18:00" }]);
  };

  /**
   * Remove a slot row from a weekday.
   *
   * @param dayOfWeek - Day index.
   * @param index - Slot index within the day.
   */
  const removeSlot = (dayOfWeek: number, index: number) => {
    const day = schedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    updateDaySlots(
      dayOfWeek,
      day.slots.filter((_, i) => i !== index)
    );
  };

  /**
   * Patch a single slot field.
   *
   * @param dayOfWeek - Day index.
   * @param index - Slot index.
   * @param field - Start or end time field.
   * @param time - New HH:MM value.
   */
  const patchSlot = (
    dayOfWeek: number,
    index: number,
    field: keyof WeeklyAvailabilitySlot,
    time: string
  ) => {
    const day = schedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    const slots = day.slots.map((slot, i) =>
      i === index ? { ...slot, [field]: time } : slot
    );
    updateDaySlots(dayOfWeek, slots);
  };

  return (
    <div className="trainer-weekly-schedule" aria-labelledby="trainer-weekly-schedule-heading">
      <div className="trainer-weekly-schedule__intro">
        <h4 id="trainer-weekly-schedule-heading" className="font-semibold mb-0 text-base">
          Weekly schedule
        </h4>
        <p className="text-muted text-sm mb-0">
          Add your available hours for each day. Companies can only book inside these windows.
        </p>
        {!hasSavedSchedule && (
          <p className="text-amber-700 text-sm mb-0" role="status">
            No schedule saved yet — add at least one time slot and click Save schedule.
          </p>
        )}
      </div>

      <div className="trainer-weekly-schedule__grid">
        {schedule.map((day) => (
          <article
            key={day.dayOfWeek}
            className="trainer-weekly-schedule__day"
            aria-label={`${WEEKDAY_LABELS[day.dayOfWeek]} availability`}
          >
            <div className="trainer-weekly-schedule__day-head">
              <span className="trainer-weekly-schedule__day-label">
                {WEEKDAY_LABELS[day.dayOfWeek]}
              </span>
              <button
                type="button"
                className="trainer-weekly-schedule__add-btn"
                onClick={() => addSlot(day.dayOfWeek)}
                aria-label={`Add time slot for ${WEEKDAY_LABELS[day.dayOfWeek]}`}
              >
                <i className="ri-add-line" aria-hidden="true" />
                Add slot
              </button>
            </div>

            {day.slots.length === 0 ? (
              <p className="trainer-weekly-schedule__empty">Not available</p>
            ) : (
              <ul className="trainer-weekly-schedule__slots">
                {day.slots.map((slot, index) => (
                  <li key={`${day.dayOfWeek}-${index}`} className="trainer-weekly-schedule__slot">
                    <label className="sr-only" htmlFor={`slot-start-${day.dayOfWeek}-${index}`}>
                      Start time
                    </label>
                    <input
                      id={`slot-start-${day.dayOfWeek}-${index}`}
                      type="time"
                      className="form-control trainer-weekly-schedule__time-input"
                      value={slot.startTime}
                      onChange={(e) =>
                        patchSlot(day.dayOfWeek, index, "startTime", e.target.value)
                      }
                    />
                    <span className="trainer-weekly-schedule__slot-sep" aria-hidden="true">
                      to
                    </span>
                    <label className="sr-only" htmlFor={`slot-end-${day.dayOfWeek}-${index}`}>
                      End time
                    </label>
                    <input
                      id={`slot-end-${day.dayOfWeek}-${index}`}
                      type="time"
                      className="form-control trainer-weekly-schedule__time-input"
                      value={slot.endTime}
                      onChange={(e) => patchSlot(day.dayOfWeek, index, "endTime", e.target.value)}
                    />
                    <button
                      type="button"
                      className="trainer-weekly-schedule__remove-btn"
                      onClick={() => removeSlot(day.dayOfWeek, index)}
                      aria-label={`Remove slot ${index + 1} on ${WEEKDAY_LABELS[day.dayOfWeek]}`}
                    >
                      <i className="ri-delete-bin-line" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>

      <button
        type="button"
        className="ti-btn ti-btn-primary !bg-primary !text-white trainer-weekly-schedule__save-btn"
        disabled={saving}
        onClick={() => void onSave()}
        aria-label="Save weekly availability schedule"
      >
        {saving ? "Saving schedule…" : "Save schedule"}
      </button>
    </div>
  );
};

export default TrainerWeeklyAvailabilityEditor;
