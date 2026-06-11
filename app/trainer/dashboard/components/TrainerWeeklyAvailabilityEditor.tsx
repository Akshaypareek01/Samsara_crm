"use client";

import React, { useEffect, useState } from "react";
import type { WeeklyAvailabilityDay, WeeklyAvailabilitySlot } from "@/shared/utils/trainerAvailabilityUtils";
import { WEEKDAY_LABELS } from "@/shared/utils/trainerAvailabilityUtils";

type TrainerWeeklyAvailabilityEditorProps = {
  value: WeeklyAvailabilityDay[];
  saving?: boolean;
  onChange: (next: WeeklyAvailabilityDay[]) => void;
  onSave: () => void | Promise<void>;
};

/**
 * Build an empty weekly schedule with one blank slot per weekday.
 */
function createEmptySchedule(): WeeklyAvailabilityDay[] {
  return WEEKDAY_LABELS.map((_, dayOfWeek) => ({
    dayOfWeek,
    slots: [],
  }));
}

/**
 * Normalize schedule so every weekday exists in the editor state.
 *
 * @param input - Stored weekly availability from the API.
 */
function normalizeSchedule(input: WeeklyAvailabilityDay[] | undefined): WeeklyAvailabilityDay[] {
  const base = createEmptySchedule();
  if (!input?.length) {
    return base;
  }
  return base.map((day) => {
    const existing = input.find((entry) => entry.dayOfWeek === day.dayOfWeek);
    return {
      dayOfWeek: day.dayOfWeek,
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
   * Append a blank slot row for the given weekday.
   *
   * @param dayOfWeek - Day index.
   */
  const addSlot = (dayOfWeek: number) => {
    const day = schedule.find((d) => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    updateDaySlots(dayOfWeek, [...day.slots, { startTime: "09:00", endTime: "17:00" }]);
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
    <div className="space-y-4" aria-labelledby="trainer-weekly-schedule-heading">
      <div>
        <h4 id="trainer-weekly-schedule-heading" className="font-semibold mb-1 text-base">
          Weekly schedule
        </h4>
        <p className="text-muted text-sm mb-0">
          Set the hours when companies can book you. Bookings outside these windows will be
          rejected.
        </p>
      </div>

      <div className="space-y-3">
        {schedule.map((day) => (
          <div
            key={day.dayOfWeek}
            className="rounded-lg border border-defaultborder p-3 bg-white dark:bg-bodybg"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-sm font-semibold text-defaulttextcolor">
                {WEEKDAY_LABELS[day.dayOfWeek]}
              </span>
              <button
                type="button"
                className="ti-btn ti-btn-sm ti-btn-soft-primary"
                onClick={() => addSlot(day.dayOfWeek)}
                aria-label={`Add time slot for ${WEEKDAY_LABELS[day.dayOfWeek]}`}
              >
                <i className="ri-add-line me-1" aria-hidden="true" />
                Add slot
              </button>
            </div>
            {day.slots.length === 0 ? (
              <p className="text-xs text-muted mb-0">Unavailable this day</p>
            ) : (
              <ul className="space-y-2 list-none ps-0 mb-0">
                {day.slots.map((slot, index) => (
                  <li key={`${day.dayOfWeek}-${index}`} className="flex flex-wrap items-center gap-2">
                    <label className="sr-only" htmlFor={`slot-start-${day.dayOfWeek}-${index}`}>
                      Start time
                    </label>
                    <input
                      id={`slot-start-${day.dayOfWeek}-${index}`}
                      type="time"
                      className="form-control form-control-sm w-auto"
                      value={slot.startTime}
                      onChange={(e) =>
                        patchSlot(day.dayOfWeek, index, "startTime", e.target.value)
                      }
                    />
                    <span className="text-muted text-sm" aria-hidden="true">
                      to
                    </span>
                    <label className="sr-only" htmlFor={`slot-end-${day.dayOfWeek}-${index}`}>
                      End time
                    </label>
                    <input
                      id={`slot-end-${day.dayOfWeek}-${index}`}
                      type="time"
                      className="form-control form-control-sm w-auto"
                      value={slot.endTime}
                      onChange={(e) => patchSlot(day.dayOfWeek, index, "endTime", e.target.value)}
                    />
                    <button
                      type="button"
                      className="ti-btn ti-btn-sm ti-btn-ghost text-danger"
                      onClick={() => removeSlot(day.dayOfWeek, index)}
                      aria-label={`Remove slot ${index + 1} on ${WEEKDAY_LABELS[day.dayOfWeek]}`}
                    >
                      <i className="ri-delete-bin-line" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        className="ti-btn ti-btn-primary !bg-primary !text-white"
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
