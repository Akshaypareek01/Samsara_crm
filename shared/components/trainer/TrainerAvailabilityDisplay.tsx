"use client";

import React from "react";
import type { WeeklyAvailabilityDay } from "@/shared/utils/trainerAvailabilityUtils";
import { formatWeeklyAvailabilityLines } from "@/shared/utils/trainerAvailabilityUtils";

type TrainerAvailabilityDisplayProps = {
  schedule?: WeeklyAvailabilityDay[];
  acceptingBookings?: boolean;
  className?: string;
};

/**
 * Read-only weekly availability schedule for company-facing trainer profiles.
 */
const TrainerAvailabilityDisplay: React.FC<TrainerAvailabilityDisplayProps> = ({
  schedule,
  acceptingBookings = true,
  className = "",
}) => {
  const lines = formatWeeklyAvailabilityLines(schedule);

  return (
    <section className={className} aria-labelledby="trainer-weekly-availability-heading">
      <h4
        id="trainer-weekly-availability-heading"
        className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2"
      >
        Weekly availability
      </h4>
      {!acceptingBookings ? (
        <p className="text-sm text-amber-700 mb-0">Not accepting new bookings right now.</p>
      ) : lines.length === 0 ? (
        <p className="text-sm text-gray-500 mb-0">
          No fixed weekly hours set. Contact admin or book during open slots when shown.
        </p>
      ) : (
        <ul className="list-none space-y-1.5 mb-0 ps-0">
          {lines.map((line) => (
            <li key={line} className="text-sm text-gray-800 flex items-start gap-2">
              <i className="ri-time-line text-primary mt-0.5 shrink-0" aria-hidden="true" />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default TrainerAvailabilityDisplay;
