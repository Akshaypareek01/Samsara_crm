"use client";

import React from "react";
import type { Booking } from "@/services/bookingService";
import {
  formatEapDurationLabel,
  getBookingEapTraining,
  getEapSyllabusDescriptionForDuration,
} from "@/shared/utils/eapTrainingUtils";

type EapBookingDetailsSectionProps = {
  booking: Booking;
};

/**
 * Displays EAP training context on a booking when eapTraining is populated.
 */
const EapBookingDetailsSection: React.FC<EapBookingDetailsSectionProps> = ({ booking }) => {
  const eapTraining = getBookingEapTraining(booking);
  if (!eapTraining?.title) return null;

  const description = getEapSyllabusDescriptionForDuration(eapTraining, booking.duration);

  return (
    <section>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">
        EAP program
      </p>
      <div className="rounded-lg border border-violet-200 bg-violet-50/50 p-3 space-y-2">
        <p className="text-sm font-semibold text-violet-900 mb-0">{eapTraining.title}</p>
        <p className="text-xs text-muted mb-0">
          Duration: {formatEapDurationLabel(booking.duration)}
        </p>
        {description && (
          <p className="text-sm mb-0 text-slate-700 whitespace-pre-wrap">{description}</p>
        )}
      </div>
    </section>
  );
};

export default EapBookingDetailsSection;
