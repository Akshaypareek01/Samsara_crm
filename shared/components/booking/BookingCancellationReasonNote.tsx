"use client";

import React from "react";

type BookingCancellationReasonNoteProps = {
  status: string;
  cancellationReason?: string | null;
  className?: string;
};

/**
 * Inline cancellation reason shown beneath booking status in list/calendar views.
 *
 * @param props - Display props.
 * @param props.status - Booking status value.
 * @param props.cancellationReason - Stored cancellation reason.
 * @param props.className - Optional wrapper classes.
 */
export default function BookingCancellationReasonNote({
  status,
  cancellationReason,
  className = "",
}: BookingCancellationReasonNoteProps) {
  const reason = cancellationReason?.trim();
  if (status !== "cancelled" || !reason) {
    return null;
  }

  return (
    <p className={`text-xs text-muted mt-1 mb-0 leading-snug max-w-xs ${className}`.trim()}>
      <span className="font-semibold text-defaulttextcolor">Reason:</span> {reason}
    </p>
  );
}
